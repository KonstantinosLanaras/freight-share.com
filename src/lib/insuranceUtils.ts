import { supabase } from '@/integrations/supabase/client';

// CMR liability: ~8.33 SDR/kg ≈ €10/kg (simplified approximation; SDR floats daily)
export const CMR_LIABILITY_EUR_PER_KG = 10;

export interface CarrierInsuranceCheck {
  ok: boolean;
  reason?: 'missing' | 'expired' | 'insufficient';
}

/**
 * Checks a carrier has a non-expired carrier_insurance record and, when
 * requiredCoverageEur is given, that its coverage_limit_eur meets or
 * exceeds it. Adequacy is only evaluated when the caller can supply a
 * required amount -- missing shipment data never blocks a booking on
 * its own, it just falls back to the existence + expiry check.
 */
export async function checkCarrierInsurance(
  carrierId: string | null | undefined,
  requiredCoverageEur?: number | null
): Promise<CarrierInsuranceCheck> {
  if (!carrierId) return { ok: false, reason: 'missing' };
  const { data } = await supabase
    .from('carrier_insurance')
    .select('expiration_date, coverage_limit_eur')
    .eq('carrier_id', carrierId)
    .maybeSingle();
  if (!data) return { ok: false, reason: 'missing' };
  if (new Date(data.expiration_date) < new Date()) return { ok: false, reason: 'expired' };
  if (requiredCoverageEur && data.coverage_limit_eur < requiredCoverageEur) {
    return { ok: false, reason: 'insufficient' };
  }
  return { ok: true };
}

export function insuranceCheckMessage(check: CarrierInsuranceCheck): string {
  switch (check.reason) {
    case 'expired':
      return "This carrier's insurance has expired — they must renew it before this booking can be finalized.";
    case 'insufficient':
      return "This carrier's insurance coverage limit is below what this shipment requires — ask them to increase their coverage before finalizing.";
    default:
      return 'This carrier has no valid insurance on file — they must add it before this booking can be finalized.';
  }
}

/** Backward-compatible boolean form for callers that don't need a reason or adequacy check. */
export async function hasValidCarrierInsurance(carrierId: string | null | undefined): Promise<boolean> {
  return (await checkCarrierInsurance(carrierId)).ok;
}
