# FreightShare — Product Backlog

Items that came up during development but were deferred. Organised by area.
Pre-launch hard-requirements live in `LAUNCH_CHECKLIST.md` instead.

---

## Payments & Stripe

- [ ] **Stripe authorization expiry for long-haul freight**
  Manual-capture PaymentIntents expire after 7 days (extendable to 30 for some card types).
  For cross-border or multi-day deliveries this can expire before the shipper confirms delivery.
  Fix: call `stripe.paymentIntents.incrementAuthorization` or re-authorize before the window closes.
  Trigger: a daily job that finds `payment_status = 'paid'` shipments whose `pickup_date_to` is >6 days ago and the PaymentIntent is still uncaptured.

- [ ] **Stripe Customer Portal for shippers**
  Edge function `create-billing-portal` already exists. Needs the Stripe Dashboard config step:
  Stripe → Settings → Billing → Customer portal → enable "Payment methods" → Save.
  Then a "Manage Billing" link can be added to the shipper settings page so users can
  update or remove saved cards without going through a new checkout.

- [ ] **Dispute resolution UI**
  `shipments.dispute_status` column exists and `release-payment` already blocks capture when
  a dispute is raised, but there is no UI for shippers/carriers to raise, view, or resolve disputes.
  Needs: dispute creation form, admin review queue, resolution flow (refund vs. partial capture).

- [ ] **Platform fee dashboard / payout reporting**
  `carrier_payout_amount` and `platform_fee_amount` are stored on completed shipments but
  nowhere surfaced to the admin. Build a simple revenue/payout report in the admin panel.

---

## Verification & Compliance

- [ ] **VAT / company existence automation**
  Currently all verifications are manual (admin reviews uploaded documents).
  Replace with API calls on form submit:
  - **VIES** (free, official): `ec.europa.eu/taxation_customs/vies/` — validates EU VAT numbers
  - Country registries as fallback (UK Companies House, French SIRENE, etc.)
  - Third-party aggregators (Kompany, Bureau van Dijk) if speed matters
  Auto-approve when the API confirms; flag for manual review otherwise.
  Target file: `CarrierVerificationForm.tsx` + a new `validate-vat` edge function.

- [ ] **Admin review queue for carrier insurance**
  Insurance certificates are uploaded but nobody ever reviews them — only self-declared
  expiry and coverage fields are checked. Add an admin review step (same pattern as
  `carrier_verifications`) before the gate is enforced.

- [ ] **ADR-authorization document upload for carriers**
  Carriers transporting hazardous goods need an ADR certificate. Self-declared pattern same
  as `carrier_insurance`, separate DB column, separate admin review.

- [ ] **Cargo Protection product — connect to licensed insurer**
  Currently illustrative-only. Either connect to a licensed insurer / IDD-registered
  intermediary or keep clearly non-binding. Do not collect real premiums without one of those.

---

## Notifications & Reminders

- [ ] **Switch daily reminders from GitHub Actions to pg_cron**
  GitHub Actions cron is reliable but external. Once Lovable grants direct Supabase access
  (service role key), apply migration `20261028000100_daily_reminder_cron.sql` and retire the
  `.github/workflows/daily-reminders.yml` workflow.

- [ ] **Route expiry reminder emails**
  `send-daily-reminders` sends expiry warnings for loads. Routes have the same expiry pattern
  (`departure_date_to < today`) but are not yet covered. Add the same 7-day and 1-day
  warning queries for the `routes` table.

- [ ] **Carrier payment-received email**
  When `release-payment` completes, the carrier gets no email confirming the transfer amount.
  Add a `carrier-payout-confirmed` template and call it from `release-payment`.

---

## Market Price Panel

- [ ] **Richer similarity matching**
  Current panel matches on location only (3-level city → country → either-country fallback).
  Future improvements:
  - Weight cargo type into similarity (refrigerated vs. general, etc.)
  - Factor pallet count ranges (don't show 1-pallet loads alongside 33-pallet loads)
  - Time-of-year weighting (seasonality)
  - Show trend arrow (is this lane getting more or less expensive?)

- [ ] **Carrier-side price intelligence**
  On `PostRoute.tsx` and `RouteDetails.tsx`, the panel currently shows shipper-posted load
  prices as a guide for carriers. Could also show historical accepted-offer prices (not just
  posted prices) to give carriers a truer market rate.

---

## Data Model & Matching

- [ ] **Itemized packing lists**
  Current model: one cargo type per load. Needs a `load_items` line-items table to support
  mixed-cargo shipments (e.g. 10 pallets electronics + 5 pallets paper).

- [ ] **Route stops with coordinates**
  Intermediate stops exist in the data model but have no lat/lng, so the proximity-matching
  logic can't use them. Add geocoding to the stop-creation flow.

- [ ] **Intermediate stop-aware matching**
  Once stops have coordinates, `BrowseRoutes.tsx` and `ShipperDashboard.tsx` matching can
  consider partial-route segments (e.g. shipper in Lyon matched to a Paris→Rome route stopping in Lyon).

---

## Admin & Operations

- [ ] **Wire `getAnalyticsConsent()` to an analytics tool**
  Consent function exists in `src/lib/analytics.ts` but is not connected to any analytics
  provider. Decide on provider (e.g. Plausible, PostHog) and wire it up.

- [ ] **Admin panel revenue report**
  Total platform fees collected, per-period breakdown, top lanes by volume.

---

## Admin panel items (carried over from original roadmap)

- [x] Fix admin access redirect while account roles load.
- [x] Verify the admin page with the requested admin account.
