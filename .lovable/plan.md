
# Plan: Route Bidding, Flexible Offers & Resolution Center

This is a large, multi-area feature. Breaking it into 4 shippable phases, each verifiable on its own. I'll confirm phase order with you before building.

---

## Phase 1 — Carrier Route Flexibility (foundation)

Without this flag the rest of the bidding flow has nothing to branch on, so it goes first.

- **DB migration**: add `allow_flexible_stops boolean default false` on `routes`, and `allow_flexible_stops_default boolean default false` on `profiles` (carrier-level default).
- **Carrier dashboard → Settings / Route Preferences**: toggle "Allow flexible stop requests" with subtext.
- **Route posting form**: checkbox "Allow shippers to request alternative stops on this route" (pre-filled from carrier default).
- **Route cards**: green "Flexible" pill on:
  - Shipper dashboard "Routes Matching Your Loads"
  - `/routes` listing page
  - Find Loads / browse views that show route cards

## Phase 2 — Route Offer Page & Bid Inbox

- **New route**: `/routes/:id/offer` (Shipper-only).
  - Header: origin → destination, pallets, date range, listed price.
  - Tabs: **Direct Bid** | **Alternative Route Offer** (second tab hidden + tooltip when flexibility off).
  - Direct Bid: price (prefilled), pallet qty, message → "Place Bid".
  - Alternative: read-only carrier route, editable pickup/dropoff with helper text + example prefill, price, pallets, justification note → "Propose Alternative Stop".
- **Wire matched route cards** (shipper dashboard + `/routes`) to navigate here instead of current behavior.
- **DB migration**: extend `offers` (or create `route_offers`) with: `offer_type` enum (`direct` | `alternative`), `proposed_pickup_city/country`, `proposed_dropoff_city/country`, `note`.
- **Carrier Bid Inbox**: section already exists for offers — add badge "Alternative Stop Proposed" with proposed pickup/dropoff displayed, plus Accept / Counter / Decline actions.
- **Confirmation screen** after submit: bid type, route summary, status "Pending carrier review".
- **Shipper tracking view**: show Direct vs Alternative tag on each offer row.

## Phase 3 — Resolution Center

- **DB migrations**:
  - `resolution_cases`: shipment_id, shipper_id, carrier_id, opened_by, issue_type enum (`late_delivery`,`cargo_damage`,`no_show`,`payment_dispute`,`route_deviation`,`other`), status enum (`open`,`under_review`,`decision_pending`,`resolved`), opened_at, resolved_at.
  - `resolution_messages`: case_id, sender_id, sender_role (`shipper`/`carrier`/`support`/`system`), body, created_at, read_by jsonb.
  - `resolution_evidence`: case_id, uploader_id, file_path, kind (photo/cmr/invoice/other).
  - Storage bucket `resolution-evidence` (private) with RLS.
  - `admin` role added to `app_role` enum for FreightShare Support.
- **Routes**:
  - `/resolution` — list of cases for current user (id, counterparty, route summary, status, opened date, filter open/closed).
  - `/resolution/:caseId` — case detail with: header, issue tag, shipment timeline, evidence upload grid, status tracker, embedded chat panel.
  - Auto system message on case open: "Your case has been received…".
  - Quick actions: Mark as Resolved (both-party agreement), Escalate to FreightShare (→ Under Review), Download Case Summary (PDF).
- **Chat**: realtime via Supabase channel on `resolution_messages`, send on Enter/button, attributed badges (Shipper/Carrier/**Support**), timestamps.
- **PDF export**: client-side using existing PDF approach for case summary (header + timeline + messages + evidence list).

## Phase 4 — Navigation & Badges

- Add "Resolution Center" entry to shipper and carrier sidebars/hamburger menu.
- Unread badge: count of cases with unread messages for current user (computed from `read_by` jsonb).
- Verify existing dashboard sections (stats, recent loads, routes) remain intact.

---

## Tech notes
- Reuses existing tables: `routes`, `offers`, `shipments`, `profiles`, `user_roles`, `shipment_timestamps`.
- All new tables follow the standard CREATE → GRANT → ENABLE RLS → POLICY pattern with `service_role` full access; admin role policies use `has_role(auth.uid(),'admin')`.
- Resolution chat scoped strictly to the case (matches existing "scoped messaging" memory).
- No GPS / no automated status changes (manual-operations memory respected).
- Bidding/payment unchanged — this layer only handles offer creation and post-match disputes.

---

## Question before I start

Do you want me to **build all 4 phases in one go**, or **ship phase by phase** (Phase 1 → review → Phase 2, etc.)? Phase-by-phase is safer for a change this size; one-go is faster but riskier to review.
