## Goal

Make **Edit Load** and **Edit Route** fully functional, and make sure the details pages display the complete departure and arrival information (dates *and* times, plus intermediate stop schedules).

## What currently doesn't work

- **Edit Load** — the dropdown item in `ShipperLoads.tsx` has no `onClick` and no `/edit` route is registered.
- **Edit Route** — `MyRoutes.tsx` navigates to `/dashboard/carrier/routes/:id/edit` and `RouteDetails.tsx` has an "Edit" button, but neither route exists.
- **Route details** — `RouteDetails.tsx` shows the departure date and departure time, but the **arrival time is never captured or displayed**, and **intermediate stops' planned date/time is missing** even though it's stored in `route_stops.planned_datetime`.
- **Load details** already shows pickup/delivery windows, but I'll double-check `LoadDetails.tsx` renders everything the shipper entered.

## Changes

### 1. Backend (single migration)

- Add `arrival_time time` column to `routes` so we can persist the destination arrival time (currently `PostRoute` throws it away in `.split('T')[0]`).

### 2. Reuse `PostLoad` / `PostRoute` as edit pages

Both pages already contain the full form. I'll turn each into a dual-mode page (create + edit) driven by an optional `:id` URL param:

- On mount, if `id` is present, fetch the row (plus `route_stops` for routes) and pre-populate every field / stop.
- On submit, branch between `insert` (create) and `update` + reconcile `route_stops` (delete + reinsert) for edit.
- Header title switches to "Edit Load" / "Edit Route" and button label to "Save changes".
- Ownership guard: redirect if the current user isn't the owner.

### 3. New routes in `App.tsx`

```
/dashboard/shipper/loads/:id/edit   → PostLoad (edit)     [shipper only]
/dashboard/carrier/routes/:id/edit  → PostRoute (edit)    [carrier only]
```

### 4. Wire the UI entry points

- `ShipperLoads.tsx`: dropdown "Edit Load" navigates to the edit route (only when status is `draft` or `posted`, i.e. no accepted offers yet).
- `RouteDetails.tsx`: header "Edit" button navigates to the edit route (owner only, and disabled once status is `active`/`completed`).
- `MyRoutes.tsx`: existing navigation already points at the new URL — no change.

### 5. Richer detail rendering

- `RouteDetails.tsx` — Schedule card:
  - Show departure **date + time** together, and the same for arrival (using the new `arrival_time`).
  - Intermediate Stops list gets a per-stop line showing `planned_datetime` formatted as "MMM d, yyyy · HH:mm".
- `PostRoute.tsx` — persist `arrival_time` when creating/editing.
- Quick pass on `LoadDetails.tsx` to confirm pickup/delivery windows, pallets, dimensions, weight, cargo notes, and price/pricing type all render.

## Technical notes

- Edit mode keeps `route_stops` in sync by deleting existing rows for the route and reinserting from form state on save — simple and matches how `PostRoute` already builds them.
- Ownership is enforced by RLS on `routes` / `loads`; the client still guards with a redirect for a clean UX.
- No changes to `client.ts` or `types.ts` beyond what the migration regenerates.

Nothing else in the app is touched.