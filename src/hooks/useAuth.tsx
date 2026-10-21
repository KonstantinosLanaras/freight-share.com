import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'shipper' | 'carrier' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  /** The currently active role (for routing/display) */
  role: AppRole | null;
  /** All roles assigned to this user */
  roles: AppRole[];
  loading: boolean;
  /** Switch the active role (only works if user has that role) */
  setActiveRole: (role: AppRole) => void;
  signUp: (email: string, password: string, fullName: string, role: AppRole, companyName?: string, country?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const setActiveRole = (role: AppRole) => {
    if (roles.includes(role)) {
      setActiveRoleState(role);
    }
  };

  useEffect(() => {
    let disposed = false;
    let requestVersion = 0;
    let authEventReceived = false;

    const restoreSession = async (nextSession: Session | null) => {
      const version = ++requestVersion;
      setLoading(true);
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setRoles([]);
        setActiveRoleState(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', nextSession.user.id);
        if (disposed || version !== requestVersion) return;
        const fetchedRoles = error ? [] : (data ?? []).map(d => d.role as AppRole);
        setRoles(fetchedRoles);
        setActiveRoleState(prev => prev && fetchedRoles.includes(prev) ? prev : fetchedRoles[0] ?? null);
      } catch {
        if (disposed || version !== requestVersion) return;
        setRoles([]);
        setActiveRoleState(null);
      } finally {
        if (!disposed && version === requestVersion) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        authEventReceived = true;
        // Wait for roles before exposing the session to protected routes.
        setLoading(true);
        setTimeout(() => {
          if (!disposed) void restoreSession(session);
        }, 0);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!disposed && !authEventReceived) void restoreSession(session);
    });

    return () => {
      disposed = true;
      requestVersion++;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: AppRole,
    companyName?: string,
    country?: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
          company_name: companyName,
          country: country,
        }
      }
    });

    // Supabase returns a user with an empty `identities` array when the email
    // is already registered (obfuscated to prevent enumeration). Surface it
    // clearly so users don't think a new account was created.
    if (!error && data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return {
        error: new Error(
          'An account with this email already exists. Please log in instead, or use "Forgot password?" to reset it.'
        ),
      };
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('is_suspended')
        .eq('id', data.user.id)
        .maybeSingle();
      if (prof?.is_suspended) {
        await supabase.auth.signOut();
        return { error: new Error('Account suspended. Please contact support.') };
      }
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Network errors are non-fatal — clearing local state is what signs the user out.
    }
    setUser(null);
    setSession(null);
    setRoles([]);
    setActiveRoleState(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      role: activeRole, 
      roles, 
      loading, 
      setActiveRole, 
      signUp, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
