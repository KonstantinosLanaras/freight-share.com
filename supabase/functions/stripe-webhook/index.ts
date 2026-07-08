// Stripe webhook receiver — STUB for future activation.
//
// Currently the app relies on the post-redirect `verify-shipment-payment`
// call to update shipment.payment_status. This endpoint is scaffolded so
// that when Stripe live mode is enabled, the same status update happens
// server-to-server (more reliable than depending on the user landing back
// on the success URL).
//
// To activate:
// 1. In your Stripe dashboard, create a webhook endpoint pointing to:
//      https://<project-ref>.supabase.co/functions/v1/stripe-webhook
//    subscribed to at least: `checkout.session.completed`,
//    `payment_intent.succeeded`, `payment_intent.payment_failed`,
//    `charge.refunded`.
// 2. Copy the signing secret and save it as STRIPE_WEBHOOK_SECRET
//    via Lovable's add_secret flow.
// 3. Uncomment the signature-verification block below.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;
    if (webhookSecret && signature) {
      // Verified path — recommended for live mode.
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret,
      );
      log("Verified event", { type: event.type, id: event.id });
    } else {
      // Unverified fallback (stub mode). SAFE ONLY IN TEST MODE.
      // Do NOT rely on this path in production — set STRIPE_WEBHOOK_SECRET.
      event = JSON.parse(rawBody) as Stripe.Event;
      log("Unverified event (stub mode)", { type: event.type });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    switch (event.type) {
      case "checkout.session.completed":
      case "payment_intent.succeeded": {
        const obj = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;
        const shipmentId =
          (obj as any).metadata?.shipment_id ??
          ((obj as Stripe.Checkout.Session).metadata?.shipment_id);
        if (shipmentId) {
          await supabase
            .from("shipments")
            .update({ payment_status: "paid", updated_at: new Date().toISOString() })
            .eq("id", shipmentId);
          log("Shipment marked paid", { shipmentId });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const shipmentId = pi.metadata?.shipment_id;
        if (shipmentId) {
          await supabase
            .from("shipments")
            .update({ payment_status: "pending", updated_at: new Date().toISOString() })
            .eq("id", shipmentId);
          log("Shipment payment failed", { shipmentId });
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const shipmentId = charge.metadata?.shipment_id;
        if (shipmentId) {
          await supabase
            .from("shipments")
            .update({ payment_status: "refunded", updated_at: new Date().toISOString() })
            .eq("id", shipmentId);
          log("Shipment refunded", { shipmentId });
        }
        break;
      }
      default:
        log("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
