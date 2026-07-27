/**
 * Single switch for whether compliance gates (business KYC verification,
 * carrier insurance on file) actually block an action, versus letting the
 * platform be browsed and demoed end-to-end without stops during beta.
 *
 * The checks themselves (isProfileVerified, checkCarrierInsurance) always
 * compute the true status regardless of this flag -- only enforcement is
 * gated, so the UI can still show real state honestly while not blocking
 * beta testers. Must return true (i.e. isDemoMode must be false) before
 * real payments go live -- see LAUNCH_CHECKLIST.md.
 */
export function complianceGatesEnforced(isDemoMode: boolean): boolean {
  return !isDemoMode;
}
