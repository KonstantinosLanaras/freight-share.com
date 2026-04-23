import React, { createContext, useContext, useState, useCallback } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  /** Returns true if action should proceed (verified or demo mode). Shows toast in demo mode. */
  checkVerification: (verificationStatus: string | null) => boolean;
  /** Simulates payment in demo mode. Returns true if simulated. */
  shouldSimulatePayment: () => boolean;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  // Platform runs in demo mode by default at all times — no live mode for now.
  const [isDemoMode] = useState(true);

  const toggleDemoMode = useCallback(() => {
    // No-op: demo mode is locked on for the entire platform.
  }, []);

  const checkVerification = useCallback(
    (verificationStatus: string | null): boolean => {
      if (verificationStatus === 'verified') return true;
      if (isDemoMode) return true; // bypass in demo
      return false;
    },
    [isDemoMode]
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
