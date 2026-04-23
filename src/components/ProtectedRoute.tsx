import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('shipper' | 'carrier' | 'admin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, roles, loading } = useAuth();
  const { isDemoMode } = useDemoMode();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // In demo mode the entire platform is browsable as a guest — bypass auth gates.
  if (isDemoMode) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  // No roles assigned yet → send to role selection (onboarding)
  if (roles.length === 0) {
    return <Navigate to="/select-role" replace />;
  }

  if (allowedRoles && role) {
    // If active role doesn't match but user HAS one of the allowed roles,
    // the route is still accessible (multi-role user)
    const hasAllowedRole = allowedRoles.some(r => roles.includes(r));
    
    if (!allowedRoles.includes(role) && !hasAllowedRole) {
      // User doesn't have any of the allowed roles → redirect to their dashboard
      const correctPath = role === 'shipper' ? '/dashboard/shipper' : '/dashboard/carrier';
      return <Navigate to={correctPath} replace />;
    }
  }

  return <>{children}</>;
}
