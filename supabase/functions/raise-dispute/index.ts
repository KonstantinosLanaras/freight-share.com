import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RAISE-DISPUTE] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { shipmentId, reason } = await req.json();
    
    if (!shipmentId || !reason) {
      throw new Error("Missing required fields: shipmentId and reason");
    }
    logStep("Request data received", { shipmentId, reason: reason.substring(0, 50) });

    // Fetch the shipment
    const { data: shipment, error: shipmentError } = await supabaseClient
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .maybeSingle();

    if (shipmentError || !shipment) {
      throw new Error("Shipment not found");
    }

    // Only shipper can raise a dispute
    if (shipment.shipper_id !== user.id) {
      throw new Error("Only the shipper can raise a dispute");
    }

    // Check if shipment is in a disputable state (delivered but not yet completed)
    if (shipment.status !== 'delivered') {
      throw new Error("Disputes can only be raised for delivered shipments awaiting confirmation");
    }

    // Check if already disputed
    if (shipment.dispute_status) {
      throw new Error("A dispute has already been raised for this shipment");
    }

    // Check 48-hour window
    if (shipment.delivery_marked_at) {
      const deliveryTime = new Date(shipment.delivery_marked_at);
      const now = new Date();
      const hoursSinceDelivery = (now.getTime() - deliveryTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceDelivery > 48) {
        throw new Error("Dispute window has closed. Disputes must be raised within 48 hours of delivery.");
      }
    }

    logStep("Shipment verified for dispute", { 
      status: shipment.status,
      deliveryMarkedAt: shipment.delivery_marked_at 
    });

    // Update shipment with dispute
    const { error: updateError } = await supabaseClient
      .from('shipments')
      .update({
        dispute_status: 'raised',
        dispute_reason: reason,
        dispute_raised_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentId);

    if (updateError) {
      throw new Error(`Failed to raise dispute: ${updateError.message}`);
    }

    // Add timestamp record
    await supabaseClient
      .from('shipment_timestamps')
      .insert({
        shipment_id: shipmentId,
        status: 'delivered', // Keep current status
        notes: `Dispute raised: ${reason.substring(0, 200)}`,
        changed_by: user.id,
      });

    logStep("Dispute raised successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Dispute raised successfully. Payment execution is paused pending resolution.",
      disputeStatus: 'raised'
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
