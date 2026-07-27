import { supabase } from '@/integrations/supabase/client';

/**
 * True only if the given profile's own business verification (KYC:
 * company registration, VAT, reviewed by an admin in AdminPanel.tsx)
 * has been approved. Separate from carrier_insurance -- a user can be
 * verified with no insurance on file, or have insurance with a
 * rejected/pending verification; the two aren't linked.
 */
export async function isProfileVerified(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('id', userId)
    .maybeSingle();
  return data?.verification_status === 'verified';
}
