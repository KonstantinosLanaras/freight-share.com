import { supabase } from '@/integrations/supabase/client';

/**
 * True only if the carrier has a carrier_insurance row on file whose
 * expiration_date hasn't passed. Mirrors the expiry check already used
 * in LoadDetails.tsx, InsuranceSummaryCard.tsx, and CarrierRequestDetails.tsx,
 * centralized so every path that finalizes a carrier booking applies it
 * the same way.
 */
export async function hasValidCarrierInsurance(carrierId: string | null | undefined): Promise<boolean> {
  if (!carrierId) return false;
  const { data } = await supabase
    .from('carrier_insurance')
    .select('expiration_date')
    .eq('carrier_id', carrierId)
    .maybeSingle();
  if (!data) return false;
  return new Date(data.expiration_date) >= new Date();
}
