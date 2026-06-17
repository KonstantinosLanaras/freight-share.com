# Profile Pages — Shipper, Carrier, and Admin Users

A large feature spanning routing, two new public-facing profile pages, an admin users table, and link wiring across the existing app. Outlined below; will implement after approval.

## 1. Routes (in `src/App.tsx`)
- `/profile/shipper/:userId` → `ShipperProfile.tsx`
- `/profile/carrier/:userId` → `CarrierProfile.tsx`
- `/admin/users` → `AdminUsers.tsx` (admin-only, suspended-user check)
- All three redirect to `/login` (existing `/auth`) when unauthenticated.

## 2. Database (single migration)
New columns / tables to back the spec. Will need approval.

**`profiles` additions:** `logo_url`, `bio` (≤200), `contact_email`, `vat_number`, `vat_status` (`unverified|pending|verified`), `preferred_cargo_types text[]`, `shipment_frequency`, `fleet_description`, `operating_countries text[]`, `vehicle_types text[]`, `max_pallet_capacity int`, `operator_licence`, `cmr_insurance bool`, `cmr_expiry date`, `route_flexibility_default bool`, `is_suspended bool`, `last_active_at`, `profile_completion int`.

**New storage bucket:** `company-logos` (public).

**RLS:**
- Authenticated users can read minimal profile fields of any non-suspended user.
- Contact email + VAT number visible only when (a) own profile, (b) admin, or (c) a `shipments` row links the two users in active/completed status.
- Own-profile update policy unchanged. Admins (via `has_role`) can update verified flags + `is_suspended`.

## 3. Page structure

### Header (shared component `ProfileHeader`)
Logo (or initials fallback) · company name · verified badge / pending badge / Profile Complete badge · member since · country flag(s) · bio/fleet description.

### Stats bar (`ProfileStats`)
Shipper: loads posted, completed shipments, bid acceptance %, **own-only** total spend.  
Carrier: routes posted, completed shipments, on-time %, avg rating, **own-only** total earned.

### Sections (own + public)
- Active Loads / Active Routes with "View All".
- Shipment / Route History — paginated table, 10 rows/page.
- Reviews & Ratings — average + cards, read-only.

### Own-profile extras
- Profile completion bar at top + expandable checklist of missing items.
- Inline edit dialog/sheet for the editable fields listed in the spec (different field sets per role).
- Fleet & Compliance card (carrier only) with vehicle types multi-select, max pallets, insurance doc upload (`insurance-documents` bucket already exists) showing Uploaded/Pending/Verified, operator licence, CMR checkbox + expiry. Locked (disabled) on public view.

### Contact details gating
Compute `canSeeContact = ownProfile || isAdmin || hasSharedShipment(viewer, profileUser)`. Hide contact email / phone otherwise.

## 4. Link wiring
- Dashboard nav company name/avatar → own profile.
- Carrier bid inbox (`CarrierRequests`) shipper name → public profile in a `Sheet` slide-over.
- `RouteOfferPage` carrier name → public profile slide-over.
- `Resolution` / `ResolutionCase` counterparty name → public profile.
- Review cards across the app → reviewer profile.
Implement a small `ProfileLink` + `ProfilePeekSheet` so the slide-over is reusable.

## 5. Admin `/admin/users`
Table: name, email, role, country, verified, member since, completion %, last active. Row click → admin edit mode of the profile page (verified toggle, VAT approve, insurance verify, suspend/deactivate). Suspended users hitting `/auth` see "Account suspended. Please contact support." Add a global gate in the auth provider that signs suspended users out with that toast.

## 6. Profile completion formula
Weight the editable fields equally; the checklist surfaces the same list of missing items. Recomputed on save via a small util shared by both profiles.

## 7. Files to add
```text
src/pages/ShipperProfile.tsx
src/pages/CarrierProfile.tsx
src/pages/AdminUsers.tsx
src/components/profile/ProfileHeader.tsx
src/components/profile/ProfileStats.tsx
src/components/profile/ProfileCompletion.tsx
src/components/profile/ReviewsSection.tsx
src/components/profile/ProfilePeekSheet.tsx
src/components/profile/EditProfileDialog.tsx
src/components/profile/FleetComplianceCard.tsx
src/lib/profileCompletion.ts
supabase/migrations/<timestamp>_profiles_extend.sql
```

## 8. Out of scope / assumptions
- "Login" route = existing `/auth`.
- Bid acceptance %, on-time %, total spend/earned derived from existing `offers` / `shipments` / `ratings` tables; if a metric has no data source it shows `—`.
- Admin role check uses existing `has_role(auth.uid(),'admin')`; if no admin role exists yet I'll add it to the `app_role` enum in the same migration.

Approve and I'll ship it in order: migration → shared components → shipper page → carrier page → admin page → cross-app link wiring.
