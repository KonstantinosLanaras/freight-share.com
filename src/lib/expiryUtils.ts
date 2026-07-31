/**
 * Determines whether a posted load or route has "passed" -- its pickup/
 * departure window is over. Passed items should still be visible in
 * suggested/browse lists (never silently hidden), just visually marked so
 * shippers/carriers know not to expect a response.
 */

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export function isLoadExpired(pickupDateTo: string): boolean {
  return pickupDateTo < todayIso();
}

export interface RouteExpiryFields {
  departure_date_to: string;
  arrival_date_to?: string | null;
  arrival_date_from?: string | null;
  open_to_extra_stops?: boolean | null;
}

/**
 * Mirrors the visibility window a route was always meant to have: a fixed
 * route "expires" at departure, one open to extra stops stays relevant
 * until it actually arrives.
 */
export function isRouteExpired(route: RouteExpiryFields): boolean {
  const today = todayIso();
  if (route.open_to_extra_stops) {
    const arrivalDate = route.arrival_date_to || route.arrival_date_from || route.departure_date_to;
    return arrivalDate < today;
  }
  return route.departure_date_to < today;
}
