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
  // Platform runs in demo mode by default at all times — no live mode for now.
  // Do not flip this to false without checking LAUNCH_CHECKLIST.md first --
  // it also controls whether compliance gates (see complianceGating.ts)
  // actually block an action, not just payment simulation.
  const [isDemoMode] = useState(true);

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
