import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Package, Truck, ArrowRight, Loader2, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

export default function SelectRole() {
  const { user, role, roles, loading, setActiveRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth?mode=login', { replace: true });
      return;
    }

    // Single role → skip this screen entirely, route straight to dashboard
    if (roles.length === 1) {
      const path = roles[0] === 'shipper' ? '/dashboard/shipper' : '/dashboard/carrier';
      navigate(path, { replace: true });
      return;
    }
  }, [user, roles, loading, navigate]);

  if (loading || (roles.length === 1)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const isNewUser = roles.length === 0;
  const isWorkspaceSwitcher = roles.length > 1;

  const handleSelect = (selectedRole: 'shipper' | 'carrier') => {
    setActiveRole(selectedRole);
    const path = selectedRole === 'shipper' ? '/dashboard/shipper' : '/dashboard/carrier';
    navigate(path, { replace: true });
  };

  // --- Copy by state ---
  const heading = isWorkspaceSwitcher
    ? 'Switch workspace'
    : 'Welcome to FreightShare';

  const subtitle = isWorkspaceSwitcher
    ? 'You have access to both workspaces. Choose where to continue.'
    : 'Choose how you'll use the platform. You can always change this later.';

  const shipperCta = isWorkspaceSwitcher ? 'Continue as Shipper' : 'Get started as Shipper';
  const carrierCta = isWorkspaceSwitcher ? 'Continue as Carrier' : 'Get started as Carrier';

  const shipperDescription = isWorkspaceSwitcher
    ? 'Manage loads, review offers, and track shipments.'
    : 'Post your loads, compare carrier offers, and ship with confidence. Manage everything from one dashboard.';

  const carrierDescription = isWorkspaceSwitcher
    ? 'Manage routes, find loads, and track deliveries.'
    : 'Browse available loads, post your routes, and fill your trucks. Grow your transport business efficiently.';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-10 max-w-lg">
        {isWorkspaceSwitcher && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-5">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Workspace
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
          {heading}
        </h1>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
        {/* Shipper */}
        {(isNewUser || roles.includes('shipper')) && (
          <button
            onClick={() => handleSelect('shipper')}
            className={`group relative overflow-hidden rounded-2xl border-2 bg-card p-7 md:p-8 text-left transition-all duration-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              role === 'shipper'
                ? 'border-primary shadow-sm shadow-primary/5'
                : 'border-border hover:border-primary hover:shadow-primary/10'
            }`}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-bl-full transition-all duration-300 group-hover:w-36 group-hover:h-36 group-hover:bg-primary/10" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                {role === 'shipper' && isWorkspaceSwitcher && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-3 w-3" />
                    Current
                  </span>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-1.5">
                Shipper
              </h2>

              <p className="text-muted-foreground text-sm md:text-base mb-5 leading-relaxed">
                {shipperDescription}
              </p>

              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <span>{shipperCta}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        )}

        {/* Carrier */}
        {(isNewUser || roles.includes('carrier')) && (
          <button
            onClick={() => handleSelect('carrier')}
            className={`group relative overflow-hidden rounded-2xl border-2 bg-card p-7 md:p-8 text-left transition-all duration-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              role === 'carrier'
                ? 'border-accent shadow-sm shadow-accent/5'
                : 'border-border hover:border-accent hover:shadow-accent/10'
            }`}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-accent/5 rounded-bl-full transition-all duration-300 group-hover:w-36 group-hover:h-36 group-hover:bg-accent/10" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center transition-colors group-hover:bg-accent/20">
                  <Truck className="h-6 w-6 text-accent" />
                </div>
                {role === 'carrier' && isWorkspaceSwitcher && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                    <CheckCircle2 className="h-3 w-3" />
                    Current
                  </span>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-1.5">
                Carrier
              </h2>

              <p className="text-muted-foreground text-sm md:text-base mb-5 leading-relaxed">
                {carrierDescription}
              </p>

              <div className="flex items-center gap-2 text-accent font-medium text-sm">
                <span>{carrierCta}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
