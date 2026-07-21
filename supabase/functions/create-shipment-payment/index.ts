import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { PLATFORM_FEE_PERCENTAGE } from "../_shared/stripeConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SHIPMENT-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { shipmentId, amount, description, loadId, carrierId } = await req.json();

    if (!shipmentId || !amount) {
      throw new Error("Missing required fields: shipmentId and amount");
    }
    if (!carrierId) {
      throw new Error("Missing required field: carrierId");
    }
    logStep("Request data received", { shipmentId, amount, loadId, carrierId });

    // The carrier must have a Stripe Express account with charges and
    // payouts enabled before the shipper can pay -- otherwise capture would
    // succeed but there'd be nowhere for the money to go.
    const { data: carrierProfile, error: carrierProfileError } = await supabaseClient
      .from('profiles')
      .select('stripe_connect_account_id, stripe_connect_onboarded')
      .eq('id', carrierId)
      .maybeSingle();
    if (carrierProfileError) throw new Error(`Failed to look up carrier: ${carrierProfileError.message}`);

    const carrierAccountId = carrierProfile?.stripe_connect_account_id as string | null;
    if (!carrierAccountId || !carrierProfile?.stripe_connect_onboarded) {
      throw new Error("This carrier hasn't finished payout setup yet. Ask them to complete Stripe onboarding before paying for this shipment.");
    }
    logStep("Carrier payout account verified", { carrierAccountId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if a Stripe customer exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    // Create a Checkout session for the shipment payment
    // Using delayed capture: payment is authorised now, captured on delivery confirmation
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Shipment Payment - ${shipmentId}`,
              description: description || `Conditional payment for shipment ${shipmentId}`,
              metadata: {
                shipment_id: shipmentId,
                load_id: loadId || '',
                carrier_id: carrierId || '',
              },
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        capture_method: 'manual', // Delayed capture - authorised now, captured on delivery
        // Destination charge: this share of the amount stays with the
        // platform, the remainder transfers to the carrier's connected
        // account automatically the moment the payment is captured.
        application_fee_amount: Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100),
        transfer_data: {
          destination: carrierAccountId,
        },
        metadata: {
          shipment_id: shipmentId,
          shipper_id: user.id,
          carrier_id: carrierId || '',
          payment_type: 'conditional_transfer',
        },
      },
      metadata: {
        shipment_id: shipmentId,
        shipper_id: user.id,
        carrier_id: carrierId || '',
      },
      success_url: `${req.headers.get("origin")}/shipment/${shipmentId}?payment=success`,
      cancel_url: `${req.headers.get("origin")}/shipment/${shipmentId}?payment=cancelled`,
    });

    logStep("Checkout session created", { sessionId: session.id, sessionUrl: session.url });

    // Update shipment with pending payment reference
    const { error: updateError } = await supabaseClient
      .from('shipments')
      .update({
        payment_reference: session.id,
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentId)
      .eq('shipper_id', user.id);

    if (updateError) {
      logStep("Warning: Could not update shipment", { error: updateError.message });
    } else {
      logStep("Shipment updated with payment reference");
    }

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
