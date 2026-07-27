# Pre-launch checklist

This platform runs in **beta mode** (`useDemoMode.tsx`, `isDemoMode` hardcoded `true`) so it can be browsed, demoed, and tested end-to-end without stops. Payments are simulated, and the compliance gates below are bypassed with a visible "Beta: ... bypassed for testing" notice rather than blocking the action. None of that is safe once real money moves. This is the single list of what has to happen before flipping `isDemoMode` to `false`.

## Must fix/verify before going live

- [ ] **Confirm Stripe Connect actually works end-to-end.** Onboard a real carrier through Stripe Express test mode, complete a payment, and confirm a transfer shows up in the Stripe Dashboard. This is the one piece that can't be verified from code.
- [ ] **Set `STRIPE_WEBHOOK_SECRET`** in the Supabase project and confirm the webhook endpoint is receiving and verifying real events (code already enforces signature verification — this is a config step, not a code change).
- [ ] **Decide how carrier business verification gets enforced for real.** `AdminPanel.tsx` has a working review queue for `carrier_verifications`, but nobody is actively reviewing submissions yet. Before `complianceGatesEnforced` starts blocking real users, make sure that queue is staffed, or carriers will get stuck with no way through.
- [ ] **Build (or decide to skip) an admin review step for `carrier_insurance`.** Unlike business verification, nobody ever reviews the uploaded insurance certificate — the expiry/adequacy checks added this session only check the self-declared fields, not whether the document is real. At minimum, decide whether this needs a review queue before it's a hard requirement.
- [ ] **Decide the Cargo Protection product's real status.** It's currently correctly labeled as illustrative-only, no real premium collected. Either connect it to a licensed insurer/IDD-registered intermediary, or leave it removed/clearly non-binding — don't let it start collecting real premiums without one of those two.
- [ ] **Run the pending migration**: `supabase/migrations/20260727150000_shipment_declared_cargo_value.sql` (adds `shipments.declared_cargo_value_eur`) needs to be applied via Lovable's migration tool or the Supabase CLI/dashboard — pushing it to GitHub alone does not apply it.
- [ ] **Get a Luxembourg-qualified lawyer (transport/platform experience) to review**: the Terms of Service text (drafted this session, not legal advice), and specifically whether FreightShare's actual commercial flow (who sets price, who selects the carrier, who takes payment as principal vs. agent) reads as marketplace intermediation or as freight forwarding under French/German/Italian-style commissionnaire/Spediteur/spedizioniere rules. This is the one question that's expensive to get wrong and cheap to ask before launch.
- [ ] **Get professional indemnity / tech E&O insurance in place** once transacting for real — the honest mitigation for residual risk no disclaimer reaches.

## Already done, just flagging as complete

- [x] Stripe webhook signature verification enforced in code (no more unverified fallback).
- [x] Stripe Connect destination charges wired (`create-shipment-payment`, `release-payment`, `create-connect-account`, `check-connect-status`).
- [x] Minimal proof-of-delivery capture (photo/signature/condition/geo), immutable by RLS.
- [x] Route/load capacity correctly deducted on every acceptance path.
- [x] Insurance-required and business-verification gates implemented and wired into all four booking-finalization paths (`CarrierRequestDetails.tsx`, `OffersShipper.tsx` ×2, `DeviationRequestCard.tsx`) — currently bypassed for beta via `complianceGatesEnforced`, ready to enforce once flipped on.
- [x] Insurance coverage-adequacy check (not just existence/expiry) against CMR liability exposure.
- [x] Real Terms of Service / Privacy Policy text (still needs the lawyer pass above).
- [x] CMR-style consignment note and invoice/receipt generation from shipment records — deliberately built as a form (renders entered data) rather than an adviser (doesn't infer/complete/validate), with informational-only disclaimers.
- [x] Customs/ADR documentation notice — an unfiltered checklist with conditions, not a computed determination of what a specific shipment requires.

## Explicitly deferred, not started

- [ ] Itemized packing lists (needs a new line-items table — current data model is one cargo type per load).
- [ ] ADR-authorization document upload/gate for carriers (same self-declared pattern as `carrier_insurance`, distinct schema addition).
- [ ] Intermediate route-stop-aware matching (route stops have no lat/lng yet).
- [ ] Wiring `getAnalyticsConsent()` to anything — moot until an actual analytics tool is added.

## How the beta bypass works, for future reference

`src/lib/complianceGating.ts` exports `complianceGatesEnforced(isDemoMode)` — the single switch checked at every gate (`LoadDetails.tsx`, `CarrierRequestDetails.tsx`, `OffersShipper.tsx`, `DeviationRequestCard.tsx`). The underlying checks (`checkCarrierInsurance`, `isProfileVerified`) always compute the true status; only whether a failed check *blocks* the action is gated. Flipping `isDemoMode` to `false` in `useDemoMode.tsx` turns all of these into real, hard blocks in one place — don't do that until the items above are checked off.
