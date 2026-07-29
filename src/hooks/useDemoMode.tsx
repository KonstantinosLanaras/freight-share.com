import React, { createContext, useContext, useState, useCallback } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  /** Returns true only if the business is actually verified -- payment simulation is a separate concern from KYC. */
  checkVerification: (verificationStatus: string | null) => boolean;
  /** Simulates payment in demo mode. Returns true if simulated. */
  shouldSimulatePayment: () => boolean;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  // Stripe is now wired up in test mode (STRIPE_MODE=test), so real payment
  // flows should go through create-shipment-payment instead of being
  // simulated client-side. Compliance gates (see complianceGating.ts) are
  // still evaluated but not enforced during beta -- they read this flag too.
  const [isDemoMode] = useState(false);


  const toggleDemoMode = useCallback(() => {
    // No-op: demo mode is locked on for the entire platform.
  }, []);

  const checkVerification = useCallback(
    (verificationStatus: string | null): boolean => verificationStatus === 'verified',
    []
  );

  const shouldSimulatePayment = useCallback(() => isDemoMode, [isDemoMode]);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, checkVerification, shouldSimulatePayment }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider');
  return ctx;
}
