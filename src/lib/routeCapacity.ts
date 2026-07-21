import { supabase } from '@/integrations/supabase/client';

/**
 * Deducts an accepted booking's pallet count from a route's
 * available_pallets, clamped at 0. No-ops if routeId is missing or
 * pallets is falsy -- an offer/request not tied to a specific route has
 * no capacity to deduct from.
 *
 * Mirrors the pattern already used in CarrierRequestDetails.tsx and
 * DeviationRequestCard.tsx, centralized so every place that accepts a
 * booking against a route applies it the same way.
 */
export async function deductRoutePallets(routeId: string | null | undefined, pallets: number | null | undefined): Promise<void> {
  if (!routeId || !pallets) return;
  const { data: route, error } = await supabase
    .from('routes')
    .select('available_pallets')
    .eq('id', routeId)
    .maybeSingle();
  if (error || !route) return;

  const newAvailable = Math.max(0, (route.available_pallets || 0) - pallets);
  await supabase.from('routes').update({ available_pallets: newAvailable }).eq('id', routeId);
}
