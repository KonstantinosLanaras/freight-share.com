// Stripe webhook receiver.
//
// Backs up the post-redirect `verify-shipment-payment` call by updating
// shipment.payment_status server-to-server -- more reliable than depending
// on the user landing back on the success URL.
//
// Every request must carry a valid `stripe-signature` verified against
// STRIPE_WEBHOOK_SECRET. There is no unverified fallback: without a
// signing secret configured, this function refuses every request rather
// than trusting an unsigned payload (anyone can POST an arbitrary JSON
// body to a public endpoint, so an unverified path would let anyone mark
// any shipment "paid" or "refunded" from outside Stripe entirely).
//
// Setup:
// 1. In your Stripe dashboard, create a webhook endpoint pointing to:
//      https://<project-ref>.supabase.co/functions/v1/stripe-webhook
//    subscribed to at least: `checkout.session.completed`,
//    `payment_intent.succeeded`, `payment_intent.payment_failed`,
//    `charge.refunded`.
// 2. Copy the signing secret and save it as STRIPE_WEBHOOK_SECRET
//    via Lovable's add_secret flow (or the Supabase dashboard).

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
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not set -- refusing to process unsigned webhook events");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Missing stripe-signature header -- refusing to process unsigned webhook events");

    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );
    log("Verified event", { type: event.type, id: event.id });

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
          log("Shipment refunded (matched via charge metadata)", { shipmentId });
        } else {
          // Charges don't always carry the PaymentIntent's metadata -- e.g.
          // a refund issued in the Stripe dashboard against an older charge
          // can silently have no metadata at all. verify-shipment-payment
          // already stores the real PaymentIntent id in
          // shipments.payment_reference once a payment is confirmed, so
          // fall back to matching on that instead of giving up.
          const paymentIntentId = typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
          if (paymentIntentId) {
            const { data: updated } = await supabase
              .from("shipments")
              .update({ payment_status: "refunded", updated_at: new Date().toISOString() })
              .eq("payment_reference", paymentIntentId)
              .select("id");
            if (updated && updated.length > 0) {
              log("Shipment refunded (matched via payment_reference fallback)", { paymentIntentId, shipmentId: updated[0].id });
            } else {
              log("charge.refunded: no shipment matched charge metadata or payment_reference", { chargeId: charge.id, paymentIntentId });
            }
          } else {
            log("charge.refunded: no shipment_id in metadata and no payment_intent on charge", { chargeId: charge.id });
          }
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
