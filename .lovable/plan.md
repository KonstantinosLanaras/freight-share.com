## Plan: Route Bidding & Flexible Offer Flow

The codebase already has the building blocks: `routes.open_to_extra_stops` + `flexibility_note` (carrier-set per route), and a `route_requests` table used by the existing `/routes/:routeId/request` page. I'll extend rather than duplicate them so the new "offer" flow lives alongside what's already shipping.

### 1. Database (single migration)

Extend `route_requests` to support bid semantics:
- `offer_type` enum (`direct` | `alternative`) — default `direct`
- `offer_price` numeric (shipper's bid)
- `proposed_pickup_city` / `proposed_pickup_country`
- `proposed_dropoff_city` / `proposed_dropoff_country`
- `pallets_requested` int
- `shipper_message` text

Existing RLS policies on `route_requests` keep working (shipper owns row, carrier sees requests on their route).

No change needed for carrier flexibility itself — `routes.open_to_extra_stops` already exists and is set on `PostRoute`.

### 2. New Route Offer Page — `/routes/:routeId/offer`

File: `src/pages/RouteOfferPage.tsx`, registered in `App.tsx`.

Layout:
- **Header**: origin → destination, available pallets, departure window, price anchor (`route.price`), carrier name + verification, "Flexible" pill when `open_to_extra_stops`.
- **Tabs** (shadcn `Tabs`):
  - **Direct Bid** (always visible): price input pre-filled with `route.price`, pallet count (max = available), message textarea, "Place Bid" button → inserts `route_requests` row with `offer_type='direct'`.
  - **Alternative Stop** (only when `route.open_to_extra_stops`): read-only carrier route line, editable pickup city/country and dropoff city/country (Schengen country select), helper text "Must be on or near the carrier's route", price + pallets + reason note, "Propose Alternative Stop" button → inserts with `offer_type='alternative'`.
  - When flexibility is off, the second tab trigger is replaced by a disabled trigger with a Tooltip "This carrier hasn't enabled route flexibility."

### 3. Confirmation screen

After successful submit, swap the page body for a confirmation card showing bid type, route summary, and status "Pending carrier review", with links back to dashboard and to "View my offers" (`/dashboard/shipper/requests`).

### 4. Route cards — Flexible badge

Add a green "Flexible" pill (Shuffle icon) on:
- `ShipperDashboard.tsx` match cards in "Routes Matching Your Loads"
- `BrowseRoutes.tsx` route cards

Conditioned on `route.open_to_extra_stops === true`.

Match cards link to `/routes/:id/offer` (replacing the current query-param link to `/routes`).

### 5. Carrier offers inbox

Update `src/pages/CarrierRequests.tsx` / `CarrierRequestDetails.tsx`:
- Show a distinct "Alternative Stop Proposed" badge when `offer_type='alternative'`
- Render the proposed pickup/dropoff prominently when present
- Keep existing Accept / Counter / Decline actions; they already exist on the request

### 6. Shipper offer tracking

`ShipperRequests.tsx` / `RouteRequestStatus.tsx`:
- Show "Direct Bid" vs "Alternative Stop" label + the proposed stops when applicable
- Status pill already exists

### 7. Carrier flexibility setting on route posting

Already present in `PostRoute.tsx` ("Route Flexibility" section with `openToExtraStops`). I'll rename the visible label to "Allow shippers to request alternative stops on this route." and keep the descriptive note as the subtext to match the spec wording. No new global per-carrier setting — per-route is cleaner with the existing model.

### Out of scope / not changing

- Shipper dashboard stats, recent loads section, sidebar/hamburger menu — untouched.
- Existing `/routes/:routeId/request` route stays for backwards compatibility but match cards now point to `/offer`.

### Technical notes

- `offer_type` added as a Postgres enum `route_offer_type`.
- Validation via existing Zod patterns in `src/lib/validationSchemas.ts`.
- City inputs are free text (no geocoding); helper text reminds shippers to stay on the corridor.
- Counter/decline flows already implemented for `route_requests` — reused as-is.

I'll run the migration first, then implement the page, badges, and inbox updates in one batch.