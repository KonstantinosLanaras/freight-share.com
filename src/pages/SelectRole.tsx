import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { Package, Truck, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';

export default function SelectRole() {
  const { user, role, roles, loading, setActiveRole } = useAuth();
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // For an already-logged-in user with a single role, jump to that dashboard.
    if (user && roles.length === 1) {
      const path = roles[0] === 'shipper' ? '/dashboard/shipper' : '/dashboard/carrier';
      navigate(path, { replace: true });
    }
  }, [user, roles, loading, navigate]);

  if (loading || (user && roles.length === 1)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSwitch = !!user && roles.length > 1;

  const handleSelect = (selectedRole: 'shipper' | 'carrier') => {
    // Logged-in users with multiple roles: switch and go to dashboard.
    if (user && roles.includes(selectedRole)) {
      setActiveRole(selectedRole);
      const path = selectedRole === 'shipper' ? '/dashboard/shipper' : '/dashboard/carrier';
      navigate(path, { replace: true });
      return;
    }

    // Otherwise (guest or new role): go to the login/signup page for that role.
    // The login page is always an intermediate step — never bypass it from here.
    navigate(`/auth?mode=login&role=${selectedRole}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar with back link */}
      <div className="container mx-auto px-4 pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
            {isSwitch ? 'Switch workspace' : 'How would you like to continue?'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isSwitch
              ? 'Choose which workspace to open.'
              : 'Choose your role to continue to the login page.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Shipper Card */}
          <Card
            role="button"
            tabIndex={0}
            onClick={() => handleSelect('shipper')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect('shipper');
              }
            }}
            className="group cursor-pointer p-8 border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Package className="h-7 w-7 text-primary" />
              </div>
              {role === 'shipper' && isSwitch && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                  Current
                </span>
              )}
            </div>

            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              I am a Shipper
            </h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              I need to ship goods.
            </p>

            <div className="flex items-center gap-2 text-primary font-medium">
              <span>{isSwitch && roles.includes('shipper') ? 'Continue as Shipper' : 'Continue'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>

          {/* Carrier Card */}
          <Card
            role="button"
            tabIndex={0}
            onClick={() => handleSelect('carrier')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect('carrier');
              }
            }}
            className="group cursor-pointer p-8 border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              {role === 'carrier' && isSwitch && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                  Current
                </span>
              )}
            </div>

            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              I am a Carrier
            </h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              I have spare truck capacity.
            </p>

            <div className="flex items-center gap-2 text-primary font-medium">
              <span>{isSwitch && roles.includes('carrier') ? 'Continue as Carrier' : 'Continue'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
