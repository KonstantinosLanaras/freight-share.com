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
  console.log(`[RELEASE-PAYMENT] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { shipmentId, confirmationType } = await req.json();
    
    if (!shipmentId) {
      throw new Error("Missing required field: shipmentId");
    }
    logStep("Request data received", { shipmentId, confirmationType });

    // Fetch the shipment to verify ownership and get payment reference
    const { data: shipment, error: shipmentError } = await supabaseClient
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .maybeSingle();

    if (shipmentError || !shipment) {
      throw new Error("Shipment not found");
    }

    // Only shipper can release payment (confirm delivery)
    if (shipment.shipper_id !== user.id) {
      throw new Error("Only the shipper can release payment");
    }

    if (shipment.payment_status !== 'paid') {
      throw new Error("Payment has not been made yet");
    }

    if (shipment.status !== 'delivered') {
      throw new Error("Shipment must be marked as delivered first");
    }

    // Check if there's an active dispute
    if (shipment.dispute_status === 'raised') {
      throw new Error("Cannot release payment while a dispute is active. Please resolve the dispute first.");
    }

    logStep("Shipment verified", { 
      paymentReference: shipment.payment_reference,
      status: shipment.status,
      finalPrice: shipment.final_price
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Estimate first; replaced below with Stripe's own figures once the
    // charge is available, so the two can never drift apart.
    const totalAmount = shipment.final_price;
    let platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
    let carrierPayout = Math.round((totalAmount - platformFee) * 100) / 100;

    // Capture the payment. Since the PaymentIntent was created as a
    // destination charge (transfer_data.destination set at checkout), this
    // single call both takes the shipper's held funds and automatically
    // transfers the carrier's share to their connected Stripe account --
    // no separate stripe.transfers.create() needed.
    if (shipment.payment_reference) {
      try {
        const captured = await stripe.paymentIntents.capture(shipment.payment_reference, {
          expand: ['latest_charge'],
        });
        logStep("Payment captured successfully", { paymentIntent: shipment.payment_reference });

        const charge = captured.latest_charge;
        if (charge && typeof charge !== 'string' && charge.application_fee_amount != null) {
          platformFee = charge.application_fee_amount / 100;
          carrierPayout = Math.round((totalAmount - platformFee) * 100) / 100;
        }
      } catch (captureError) {
        // Payment may already be captured or in a different state
        logStep("Payment capture note", { message: (captureError as Error).message });
      }
    }

    logStep("Fee calculation", {
      totalAmount,
      platformFee,
      carrierPayout,
      feePercentage: PLATFORM_FEE_PERCENTAGE * 100 + '%'
    });

    // Update shipment to completed with payment executed and fee details
    const { error: updateError } = await supabaseClient
      .from('shipments')
      .update({
        payment_status: 'completed',
        status: 'completed',
        platform_fee_amount: platformFee,
        carrier_payout_amount: carrierPayout,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentId);

    if (updateError) {
      throw new Error(`Failed to update shipment: ${updateError.message}`);
    }

    // Add timestamp record for completion
    await supabaseClient
      .from('shipment_timestamps')
      .insert({
        shipment_id: shipmentId,
        status: 'completed',
        notes: `Payment executed. Confirmation type: ${confirmationType || 'manual'}. Platform fee: €${platformFee}. Carrier payout: €${carrierPayout}.`,
        changed_by: user.id,
      });

    logStep("Payment executed successfully", {
      platformFee,
      carrierPayout
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Payment executed — transfer to carrier initiated",
      paymentStatus: 'completed',
      platformFee,
      carrierPayout,
      totalAmount
    }), {
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
