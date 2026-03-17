import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Package, Truck, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function SelectRole() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleSelect = (selectedRole: 'shipper' | 'carrier') => {
    const path = selectedRole === 'shipper' ? '/dashboard/shipper' : '/dashboard/carrier';
    navigate(path, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
          How would you like to continue?
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Select your path to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Shipper Card */}
        <button
          onClick={() => handleSelect('shipper')}
          className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 text-left transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:bg-primary/10" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/20">
              <Package className="h-7 w-7 text-primary" />
            </div>

            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Shipper
            </h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Post your loads, compare carrier offers, and ship with confidence. Manage everything from one dashboard.
            </p>

            <div className="flex items-center gap-2 text-primary font-medium">
              <span>Enter as Shipper</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>

        {/* Carrier Card */}
        <button
          onClick={() => handleSelect('carrier')}
          className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 text-left transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:bg-accent/10" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 transition-colors group-hover:bg-accent/20">
              <Truck className="h-7 w-7 text-accent" />
            </div>

            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Carrier
            </h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Browse available loads, post your routes, and fill your trucks. Grow your transport business efficiently.
            </p>

            <div className="flex items-center gap-2 text-accent font-medium">
              <span>Enter as Carrier</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
