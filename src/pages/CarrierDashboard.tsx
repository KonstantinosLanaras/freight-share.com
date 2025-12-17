import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  TrendingUp, 
  CheckCircle, 
  Truck,
  ArrowRight,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  MapPin,
  Euro,
  Loader2,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { CarrierVerificationForm } from '@/components/verification/CarrierVerificationForm';

interface Route {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  available_pallets: number;
  departure_date_from: string;
  departure_date_to: string;
  is_active: boolean;
}

interface Load {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  pallets: number;
  price: number | null;
  pricing_type: string;
  pickup_date_from: string;
  pickup_date_to: string;
  shipper_id: string;
}

interface Profile {
  full_name: string | null;
  company_name: string | null;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected' | null;
}

export default function CarrierDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [availableLoads, setAvailableLoads] = useState<Load[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [stats, setStats] = useState({ activeRoutes: 0, matchedLoads: 0, completed: 0, totalEarned: 0 });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, company_name, verification_status')
        .eq('id', user.id)
        .maybeSingle();
      
      setProfile(profileData as Profile | null);

      // Fetch carrier's routes
      const { data: routesData } = await supabase
        .from('routes')
        .select('*')
        .eq('carrier_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      setRoutes(routesData || []);

      // Fetch available loads (posted status, not by this user)
      const { data: loadsData } = await supabase
        .from('loads')
        .select('*')
        .eq('status', 'posted')
        .neq('shipper_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setAvailableLoads(loadsData || []);

      // Calculate stats
      setStats({
        activeRoutes: routesData?.length || 0,
        matchedLoads: loadsData?.length || 0,
        completed: 0,
        totalEarned: 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (from === to) {
      return format(fromDate, 'MMM d');
    }
    return `${format(fromDate, 'MMM d')}-${format(toDate, 'd')}`;
  };

  const firstName = profile?.full_name?.split(' ')[0] || profile?.company_name || 'there';

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold">FreightShare</span>
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <Truck className="h-8 w-8 text-sidebar-primary" />
                <Package className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
              </div>
              <span className="font-heading font-bold text-lg text-sidebar-foreground">
                Freight<span className="text-accent">Share</span>
              </span>
            </Link>
            <button 
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Badge */}
          <div className="px-6 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-carrier/20 rounded-full text-carrier-foreground text-sm">
              <Truck className="h-4 w-4" />
              Carrier
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <Link 
              to="/dashboard/carrier"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <TrendingUp className="h-5 w-5" />
              Dashboard
            </Link>
            <Link 
              to="/dashboard/carrier/routes"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <MapPin className="h-5 w-5" />
              My Routes
            </Link>
            <Link 
              to="/dashboard/carrier/loads"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Package className="h-5 w-5" />
              Find Loads
            </Link>
            <Link 
              to="/dashboard/carrier/shipments"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Truck className="h-5 w-5" />
              Shipments
            </Link>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-5 w-5 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || profile?.company_name || 'User'}
                </div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">
                    Welcome back, {firstName}! 🚚
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Find loads that match your routes and grow your business.
                  </p>
                </div>
                <Button variant="carrier" asChild>
                  <Link to="/dashboard/carrier/routes/new">
                    <Plus className="h-4 w-4" />
                    Post New Route
                  </Link>
                </Button>
              </div>

              {/* Verification Banner */}
              {profile?.verification_status !== 'verified' && !showVerificationForm && (
                <Card className={`mb-8 border-l-4 ${profile?.verification_status === 'pending' ? 'border-l-warning bg-warning/5' : 'border-l-primary bg-primary/5'}`}>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${profile?.verification_status === 'pending' ? 'bg-warning/20' : 'bg-primary/20'}`}>
                          {profile?.verification_status === 'pending' ? (
                            <ShieldCheck className="h-5 w-5 text-warning" />
                          ) : (
                            <ShieldAlert className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              {profile?.verification_status === 'pending' ? 'Verification in Progress' : 'Complete Business Verification'}
                            </h3>
                            {profile?.verification_status && (
                              <VerificationBadge status={profile.verification_status} size="sm" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {profile?.verification_status === 'pending' 
                              ? "We're reviewing your documents. You'll be notified once verification is complete."
                              : 'Verify your business to accept paid shipments. This protects both you and your clients.'}
                          </p>
                        </div>
                      </div>
                      {profile?.verification_status !== 'pending' && (
                        <Button variant="carrier" onClick={() => setShowVerificationForm(true)}>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Get Verified
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Verification Form */}
              {showVerificationForm && profile?.verification_status !== 'verified' && (
                <div className="mb-8">
                  <Button 
                    variant="ghost" 
                    className="mb-4"
                    onClick={() => setShowVerificationForm(false)}
                  >
                    ← Back to Dashboard
                  </Button>
                  <CarrierVerificationForm onSuccess={() => {
                    setShowVerificationForm(false);
                    fetchData();
                  }} />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-carrier/10 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-carrier" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stats.activeRoutes}</div>
                        <div className="text-sm text-muted-foreground">Active Routes</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stats.matchedLoads}</div>
                        <div className="text-sm text-muted-foreground">Available Loads</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stats.completed}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Euro className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">€{stats.totalEarned.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Earned</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* My Routes */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Routes</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/dashboard/carrier/routes">
                        View All
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {routes.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground mb-3">No routes posted yet</p>
                        <Button variant="carrier" size="sm" asChild>
                          <Link to="/dashboard/carrier/routes/new">
                            <Plus className="h-4 w-4" />
                            Post Route
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {routes.map((route) => (
                          <div 
                            key={route.id}
                            className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium text-foreground">
                                {route.origin_city}, {route.origin_country} → {route.destination_city}, {route.destination_country}
                              </div>
                              <Badge variant="secondary">Active</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {route.available_pallets} pallets · {formatDateRange(route.departure_date_from, route.departure_date_to)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Available Loads */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Available Loads</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/dashboard/carrier/loads">
                        Browse All
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {availableLoads.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">No loads available right now</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {availableLoads.map((load) => (
                          <div 
                            key={load.id}
                            className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium text-foreground">
                                  {load.origin_city}, {load.origin_country} → {load.destination_city}, {load.destination_country}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {load.pallets} pallets · {formatDateRange(load.pickup_date_from, load.pickup_date_to)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-foreground">
                                  {load.price ? `€${load.price}` : 'Open'}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full mt-2">
                              Make Offer
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
