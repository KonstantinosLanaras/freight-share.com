import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

    const { shipmentId } = await req.json();
    
    if (!shipmentId) {
      throw new Error("Missing required field: shipmentId");
    }
    logStep("Request data received", { shipmentId });

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

    logStep("Shipment verified", { 
      paymentReference: shipment.payment_reference,
      status: shipment.status 
    });

    // For MVP, we mark the payment as completed
    // In production, this would trigger a transfer to the carrier's connected account
    const { error: updateError } = await supabaseClient
      .from('shipments')
      .update({
        payment_status: 'completed',
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentId);

    if (updateError) {
      throw new Error(`Failed to update shipment: ${updateError.message}`);
    }

    logStep("Payment released successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Payment released to carrier",
      paymentStatus: 'completed'
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
