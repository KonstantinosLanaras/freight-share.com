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
  ShieldAlert,
  HelpCircle,
  MessageSquare,
  Clock,
  XCircle,
  Inbox,
  Bookmark
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { CarrierVerificationForm } from '@/components/verification/CarrierVerificationForm';
import { DeviationRequestCard } from '@/components/routes/DeviationRequestCard';
import { BookmarkButton } from '@/components/BookmarkButton';

type RouteStatus = 'planned' | 'active' | 'completed' | 'cancelled';

interface Route {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  available_pallets: number;
  departure_date_from: string;
  departure_date_to: string;
  status: RouteStatus;
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

interface DeviationRequest {
  id: string;
  route_id: string;
  shipper_id: string;
  carrier_id: string;
  pickup_address: string;
  pallets_required: number;
  preferred_time_from: string;
  preferred_time_to: string;
  deviation_description: string;
  notes: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offer';
  carrier_response: string | null;
  counter_offer_price: number | null;
  counter_offer_conditions: string | null;
  created_at: string;
  shipper?: {
    full_name: string | null;
    company_name: string | null;
  };
}

export default function CarrierDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [availableLoads, setAvailableLoads] = useState<Load[]>([]);
  const [deviationRequests, setDeviationRequests] = useState<DeviationRequest[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [carrierInsurance, setCarrierInsurance] = useState<any>(null);
  const [stats, setStats] = useState({ activeRoutes: 0, matchedLoads: 0, completed: 0, totalEarned: 0, pendingRequests: 0 });
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

      // Fetch insurance
      const { data: insuranceData } = await supabase
        .from('carrier_insurance')
        .select('*')
        .eq('carrier_id', user.id)
        .maybeSingle();
      setCarrierInsurance(insuranceData);
      // Fetch carrier's routes (active and planned only)
      const { data: routesData } = await supabase
        .from('routes')
        .select('*')
        .eq('carrier_id', user.id)
        .in('status', ['planned', 'active'])
        .order('created_at', { ascending: false })
        .limit(5);

      setRoutes((routesData as Route[]) || []);

      // Fetch available loads (posted status, not by this user)
      const { data: loadsData } = await supabase
        .from('loads')
        .select('*')
        .eq('status', 'posted')
        .neq('shipper_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setAvailableLoads(loadsData || []);

      // Fetch deviation requests for carrier
      const { data: requestsData } = await supabase
        .from('deviation_requests')
        .select('*')
        .eq('carrier_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch shipper profiles for requests
      const shipperIds = [...new Set(requestsData?.map(r => r.shipper_id) || [])];
      const { data: shipperProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, company_name')
        .in('id', shipperIds);

      const shipperMap = new Map(shipperProfiles?.map(p => [p.id, p]) || []);
      const requestsWithShippers = requestsData?.map(req => ({
        ...req,
        shipper: shipperMap.get(req.shipper_id) || null
      })) || [];

      setDeviationRequests(requestsWithShippers as DeviationRequest[]);

      // Fetch route request count
      const { count: routeRequestCount } = await supabase
        .from('route_requests')
        .select('*', { count: 'exact', head: true })
        .eq('carrier_id', user.id)
        .in('status', ['sent', 'viewed', 'in_discussion']);

      // Calculate stats
      setStats({
        activeRoutes: routesData?.length || 0,
        matchedLoads: loadsData?.length || 0,
        completed: 0,
        totalEarned: 0,
        pendingRequests: (requestsData?.length || 0) + (routeRequestCount || 0)
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
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <Badge className="bg-carrier text-carrier-foreground text-xs">Carrier</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold">FreightShare</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleSignOut}
          className="text-muted-foreground"
        >
          <LogOut className="h-4 w-4" />
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
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {/* Group 1 */}
            <Link
              to="/dashboard/carrier/find-loads"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Package className="h-5 w-5" />
              Browse Loads
            </Link>
            <Link
              to="/dashboard/carrier/shipments"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Truck className="h-5 w-5" />
              Shipments
            </Link>

            {/* Divider + Communication group */}
            <div className="pt-3 mt-3 border-t border-sidebar-border">
              <div className="px-4 mb-2">
                <span className="text-xs text-sidebar-foreground/50 uppercase tracking-wider">Communication</span>
              </div>
              <Link
                to="/dashboard/carrier/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                Messages
              </Link>
              <Link
                to="/dashboard/carrier/requests"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Inbox className="h-5 w-5" />
                Route Requests
                {stats.pendingRequests > 0 && (
                  <Badge className="ml-auto bg-primary text-primary-foreground text-xs h-5 w-5 p-0 justify-center">{stats.pendingRequests}</Badge>
                )}
              </Link>
            </div>

            {/* Divider + Group 3 */}
            <div className="pt-3 mt-3 border-t border-sidebar-border">
              <Link
                to="/dashboard/carrier/routes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <MapPin className="h-5 w-5" />
                My Routes
              </Link>
              <Link
                to="/saved-loads"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Bookmark className="h-5 w-5" />
                Saved Loads
              </Link>
            </div>
          </nav>

          {/* Help & Sign Out — Always visible at bottom */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Link
              to="/help"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
              Help & Resolution
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
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
                    Hi, {firstName}! 🚚
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Browse available loads and find work that fits your schedule.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="carrier" asChild>
                    <Link to="/dashboard/carrier/find-loads">
                      <Package className="h-4 w-4" />
                      Browse Loads
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/carrier/routes/new">
                      <Plus className="h-4 w-4" />
                      Share Route
                    </Link>
                  </Button>
                </div>
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
                {/* Pending Pickup Requests - Priority */}
                {deviationRequests.length > 0 && (
                  <Card className="lg:col-span-2 border-warning/30 bg-warning/5">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-warning" />
                        Pending Pickup Requests
                        <Badge variant="secondary">{deviationRequests.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {deviationRequests.map((request) => (
                          <DeviationRequestCard
                            key={request.id}
                            request={request}
                            isCarrier={true}
                            onUpdate={fetchData}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Available Loads - Primary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Available Loads
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/dashboard/carrier/find-loads">
                        Browse All
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {availableLoads.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground mb-3">No loads available right now</p>
                        <p className="text-sm text-muted-foreground">Check back soon for new opportunities</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {availableLoads.slice(0, 3).map((load) => (
                          <div key={load.id} className="relative">
                            <BookmarkButton id={load.id} className="absolute top-2 right-2 z-10" />
                            <Link 
                              to={`/load/${load.id}`}
                              className="block p-4 pr-12 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="font-medium text-foreground">
                                  {load.origin_city} → {load.destination_city}
                                </div>
                                <span className="text-primary font-semibold">
                                  {load.price ? `€${load.price}` : 'Open'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{load.pallets} pallets</span>
                                <span>{formatDateRange(load.pickup_date_from, load.pickup_date_to)}</span>
                              </div>
                            </Link>
                          </div>
                        ))}
                        {availableLoads.length > 3 && (
                          <Button variant="outline" className="w-full" asChild>
                            <Link to="/dashboard/carrier/find-loads">
                              View {availableLoads.length - 3} more loads
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* My Routes - Optional */}
                <Card className="border-dashed">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      My Routes
                      <Badge variant="secondary" className="text-xs font-normal">Optional</Badge>
                    </CardTitle>
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
                        <p className="text-muted-foreground mb-2">Share your routes to get matched</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Posting routes is optional but helps shippers find you
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/dashboard/carrier/routes/new">
                            <Plus className="h-4 w-4" />
                            Share a Route
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
                              <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
                                {route.status === 'active' ? 'Active' : 'Planned'}
                              </Badge>
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

              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
