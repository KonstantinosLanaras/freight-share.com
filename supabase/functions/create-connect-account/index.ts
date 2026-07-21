// Creates (or reuses) a Stripe Express connected account for the calling
// carrier, then returns a Stripe-hosted onboarding link. The carrier must
// complete this before any shipper payment naming them as carrier can be
// created -- create-shipment-payment checks stripe_connect_onboarded and
// refuses otherwise.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[CREATE-CONNECT-ACCOUNT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { returnUrl, refreshUrl } = await req.json().catch(() => ({}));
    const origin = req.headers.get("origin") ?? "";

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("stripe_connect_account_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw new Error(`Failed to load profile: ${profileError.message}`);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let accountId = profile?.stripe_connect_account_id as string | null;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      logStep("Created Express account", { accountId });

      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ stripe_connect_account_id: accountId })
        .eq("id", user.id);
      if (updateError) throw new Error(`Failed to save connected account: ${updateError.message}`);
    } else {
      logStep("Reusing existing account", { accountId });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl || `${origin}/dashboard/carrier?connect=refresh`,
      return_url: returnUrl || `${origin}/dashboard/carrier?connect=return`,
      type: "account_onboarding",
    });

    logStep("Onboarding link created", { accountId });

    return new Response(JSON.stringify({ url: accountLink.url, accountId }), {
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
