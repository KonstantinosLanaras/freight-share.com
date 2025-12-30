import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-SHIPMENT-PAYMENT] ${step}${detailsStr}`);
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

    const { sessionId, shipmentId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Missing required field: sessionId");
    }
    logStep("Request data received", { sessionId, shipmentId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { 
      status: session.payment_status, 
      paymentIntent: session.payment_intent 
    });

    if (session.payment_status === 'paid' || session.status === 'complete') {
      // Update shipment payment status to 'paid' (payment authorised, awaiting delivery confirmation)
      // Note: With manual capture, funds are authorised but not yet captured
      const { error: updateError } = await supabaseClient
        .from('shipments')
        .update({
          payment_status: 'paid',
          payment_reference: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipmentId);

      if (updateError) {
        logStep("Error updating shipment", { error: updateError.message });
        throw new Error(`Failed to update shipment: ${updateError.message}`);
      }

      // Also update the shipment status if it was 'accepted'
      await supabaseClient
        .from('shipments')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipmentId)
        .eq('status', 'accepted');

      logStep("Shipment payment verified and updated");

      return new Response(JSON.stringify({ 
        verified: true, 
        paymentStatus: 'paid',
        paymentIntent: session.payment_intent 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      verified: false, 
      paymentStatus: session.payment_status 
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
