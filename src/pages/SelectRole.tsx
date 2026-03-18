import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Package, Truck, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function SelectRole() {
  const { user, role, roles, loading, setActiveRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Not signed in → go to login
    if (!user) {
      navigate('/auth?mode=login', { replace: true });
      return;
    }

    // Single role → skip this screen entirely
    if (roles.length === 1) {
      const path = roles[0] === 'shipper' ? '/dashboard/shipper' : '/dashboard/carrier';
      navigate(path, { replace: true });
      return;
    }

    // Has an active role and didn't explicitly navigate here to switch →
    // This case is handled by the UI below for multi-role users
  }, [user, roles, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // Single role user — will redirect via useEffect, show loader briefly
  if (roles.length === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isNewUser = roles.length === 0;
  const isWorkspaceSwitcher = roles.length > 1;

  const handleSelect = (selectedRole: 'shipper' | 'carrier') => {
    setActiveRole(selectedRole);
    const path = selectedRole === 'shipper' ? '/dashboard/shipper' : '/dashboard/carrier';
    navigate(path, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        {isWorkspaceSwitcher && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4">
            <RefreshCw className="h-3.5 w-3.5" />
            Switch workspace
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
          {isWorkspaceSwitcher
            ? 'Switch workspace'
            : 'How would you like to continue?'}
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          {isWorkspaceSwitcher
            ? 'Choose which workspace to open'
            : 'Select your path to get started'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Shipper Card — only show if user has shipper role or is new */}
        {(isNewUser || roles.includes('shipper')) && (
          <button
            onClick={() => handleSelect('shipper')}
            className={`group relative overflow-hidden rounded-2xl border-2 bg-card p-8 text-left transition-all duration-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              role === 'shipper'
                ? 'border-primary shadow-md shadow-primary/10'
                : 'border-border hover:border-primary hover:shadow-primary/10'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:bg-primary/10" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                  <Package className="h-7 w-7 text-primary" />
                </div>
                {role === 'shipper' && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    Active
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                Shipper
              </h2>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Post your loads, compare carrier offers, and ship with confidence. Manage everything from one dashboard.
              </p>

              <div className="flex items-center gap-2 text-primary font-medium">
                <span>{isWorkspaceSwitcher ? 'Open Shipper workspace' : 'Enter as Shipper'}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        )}

        {/* Carrier Card — only show if user has carrier role or is new */}
        {(isNewUser || roles.includes('carrier')) && (
          <button
            onClick={() => handleSelect('carrier')}
            className={`group relative overflow-hidden rounded-2xl border-2 bg-card p-8 text-left transition-all duration-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              role === 'carrier'
                ? 'border-accent shadow-md shadow-accent/10'
                : 'border-border hover:border-accent hover:shadow-accent/10'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:bg-accent/10" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center transition-colors group-hover:bg-accent/20">
                  <Truck className="h-7 w-7 text-accent" />
                </div>
                {role === 'carrier' && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                    Active
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                Carrier
              </h2>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Browse available loads, post your routes, and fill your trucks. Grow your transport business efficiently.
              </p>

              <div className="flex items-center gap-2 text-accent font-medium">
                <span>{isWorkspaceSwitcher ? 'Open Carrier workspace' : 'Enter as Carrier'}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
