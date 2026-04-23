import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Truck,
  ArrowRight,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Loader2,
  ShieldCheck,
  MapPin,
  HelpCircle,
  MessageSquare,
  XCircle,
  Send,
  Bookmark
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { ShipperVerificationForm } from '@/components/verification/ShipperVerificationForm';
import { BookmarkButton } from '@/components/BookmarkButton';
import { useDemoMode } from '@/hooks/useDemoMode';

interface Load {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  pallets: number;
  status: string;
  price: number | null;
  pickup_date_from: string;
  pickup_date_to: string;
  created_at: string;
  offer_count?: number;
}

interface Profile {
  full_name: string | null;
  company_name: string | null;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected' | null;
}

interface PickupRequest {
  id: string;
  route_id: string;
  pickup_address: string;
  pallets_required: number;
  preferred_time_from: string;
  preferred_time_to: string;
  deviation_description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offer';
  counter_offer_price: number | null;
  counter_offer_conditions: string | null;
  created_at: string;
  route?: {
    origin_city: string;
    origin_country: string;
    destination_city: string;
    destination_country: string;
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  posted: { label: 'Posted', className: 'status-posted' },
  accepted: { label: 'Accepted', className: 'status-accepted' },
  paid: { label: 'Paid', className: 'status-paid' },
  picked_up: { label: 'Picked Up', className: 'status-picked-up' },
  delivered: { label: 'Delivered', className: 'status-delivered' },
  completed: { label: 'Completed', className: 'status-completed' },
};

export default function ShipperDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loads, setLoads] = useState<Load[]>([]);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [stats, setStats] = useState({ active: 0, pending: 0, completed: 0, totalSpent: 0, pickupRequests: 0 });
  const { user, signOut } = useAuth();
  const { isDemoMode } = useDemoMode();
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

      // Fetch loads
      const { data: loadsData, error } = await supabase
        .from('loads')
        .select('*')
        .eq('shipper_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch offer counts for each load
      const loadIds = (loadsData || []).map(l => l.id);
      let offerCountMap: Record<string, number> = {};
      if (loadIds.length > 0) {
        const { data: offersData } = await supabase
          .from('offers')
          .select('load_id')
          .in('load_id', loadIds);
        (offersData || []).forEach(o => {
          offerCountMap[o.load_id] = (offerCountMap[o.load_id] || 0) + 1;
        });
      }

      const loadsWithOffers = (loadsData || []).map(l => ({
        ...l,
        offer_count: offerCountMap[l.id] || 0,
      }));
      setLoads(loadsWithOffers);

      // Fetch pickup requests made by this shipper
      const { data: requestsData } = await supabase
        .from('deviation_requests')
        .select('*')
        .eq('shipper_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch route info for each request
      const routeIds = [...new Set(requestsData?.map(r => r.route_id) || [])];
      const { data: routesData } = await supabase
        .from('routes')
        .select('id, origin_city, origin_country, destination_city, destination_country')
        .in('id', routeIds);

      const routeMap = new Map(routesData?.map(r => [r.id, r]) || []);
      const requestsWithRoutes = requestsData?.map(req => ({
        ...req,
        route: routeMap.get(req.route_id) || null
      })) || [];

      setPickupRequests(requestsWithRoutes as PickupRequest[]);

      // Calculate stats
      const allLoads = loadsWithOffers;
      const active = allLoads.filter(l => ['posted', 'accepted', 'paid', 'picked_up'].includes(l.status)).length;
      const completed = allLoads.filter(l => l.status === 'completed').length;
      const totalSpent = allLoads
        .filter(l => l.status === 'completed' && l.price)
        .reduce((sum, l) => sum + (l.price || 0), 0);
      const pendingPickups = requestsData?.filter(r => r.status === 'pending' || r.status === 'counter_offer').length || 0;
      const totalPendingOffers = allLoads.reduce((sum, l) => sum + (l.offer_count || 0), 0);

      setStats({ active, pending: totalPendingOffers, completed, totalSpent, pickupRequests: pendingPickups });
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

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <Badge className="bg-shipper text-shipper-foreground text-xs">Shipper</Badge>
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-shipper/20 rounded-full text-shipper-foreground text-sm">
              <Package className="h-4 w-4" />
              Shipper
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {/* Group 1 */}
            <Link
              to="/dashboard/shipper/loads"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Package className="h-5 w-5" />
              My Loads
            </Link>
            <Link
              to="/dashboard/shipper/shipments"
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
                to="/dashboard/shipper/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                Messages
              </Link>
              <Link
                to="/dashboard/shipper/requests"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Send className="h-5 w-5" />
                My Requests
              </Link>
            </div>

            {/* Divider + Group 3 */}
            <div className="pt-3 mt-3 border-t border-sidebar-border">
              <Link
                to="/routes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <MapPin className="h-5 w-5" />
                Browse Routes
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
                    Hi, {firstName}! 👋
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Here's what's happening with your shipments today.
                  </p>
                </div>
                <Button variant="accent" asChild>
                  <Link to="/dashboard/shipper/loads/new">
                    <Plus className="h-4 w-4" />
                    Post New Load
                  </Link>
                </Button>
              </div>

              {/* Verification Prompt - shown when shipper needs to complete business details */}
              {profile?.verification_status !== 'verified' && !showVerificationForm && (
                <Card className="mb-8 border-l-4 border-l-primary bg-primary/5">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            Complete Business Details
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Add your business details to proceed with payments when you accept carrier offers.
                          </p>
                        </div>
                      </div>
                      <Button variant="default" onClick={() => setShowVerificationForm(true)}>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Add Details
                      </Button>
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
                  <ShipperVerificationForm onSuccess={() => {
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
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stats.active}</div>
                        <div className="text-sm text-muted-foreground">Active Loads</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
                        <div className="text-sm text-muted-foreground">Pending Offers</div>
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
                      <div className="w-12 h-12 rounded-xl bg-shipper/10 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-shipper" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">€{stats.totalSpent.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Spent</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Demo: Loads Matching Your Routes */}
              {isDemoMode && (
                <Card className="mb-6 border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Loads Matching Your Routes
                        </CardTitle>
                        <Badge variant="secondary" className="mt-2 text-xs font-normal">
                          Based on your shipping history
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[
                        { id: 'demo-1', origin: 'Milan, IT', destination: 'Munich, DE', pallets: 6, date: 'Apr 24-26', price: 720 },
                        { id: 'demo-2', origin: 'Rotterdam, NL', destination: 'Lyon, FR', pallets: 12, date: 'Apr 28', price: 1340 },
                        { id: 'demo-3', origin: 'Barcelona, ES', destination: 'Marseille, FR', pallets: 4, date: 'May 2-3', price: 480 },
                      ].map((load) => (
                        <div key={load.id} className="relative p-4 pr-12 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
                          <BookmarkButton id={load.id} className="absolute top-2 right-2 z-10" />
                          <div className="font-medium text-foreground mb-1">
                            {load.origin} → {load.destination}
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {load.pallets} pallets · {load.date}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-primary font-semibold">€{load.price}</span>
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              Match
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pickup Requests Status */}
              {pickupRequests.length > 0 && (
                <Card className="mb-6">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      My Pickup Requests
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/routes">
                        Browse Routes
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pickupRequests.map((request) => (
                        <div 
                          key={request.id}
                          className={`p-4 rounded-xl border ${
                            request.status === 'accepted' ? 'bg-success/5 border-success/30' :
                            request.status === 'rejected' ? 'bg-destructive/5 border-destructive/30' :
                            request.status === 'counter_offer' ? 'bg-primary/5 border-primary/30' :
                            'bg-muted/50 border-border'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-foreground">
                                  {request.route?.origin_city} → {request.route?.destination_city}
                                </span>
                                <Badge 
                                  variant={
                                    request.status === 'accepted' ? 'default' :
                                    request.status === 'rejected' ? 'destructive' :
                                    request.status === 'counter_offer' ? 'secondary' :
                                    'outline'
                                  }
                                  className="text-xs"
                                >
                                  {request.status === 'counter_offer' ? 'Counter Offer' : 
                                   request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {request.pallets_required} pallets · {request.pickup_address.slice(0, 50)}...
                              </div>
                              {request.status === 'counter_offer' && request.counter_offer_price && (
                                <div className="mt-2 text-sm">
                                  <span className="font-medium text-primary">Counter offer: €{request.counter_offer_price}</span>
                                  {request.counter_offer_conditions && (
                                    <span className="text-muted-foreground"> - {request.counter_offer_conditions}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center">
                              {request.status === 'pending' && <Clock className="h-4 w-4 text-muted-foreground" />}
                              {request.status === 'accepted' && <CheckCircle className="h-4 w-4 text-success" />}
                              {request.status === 'rejected' && <XCircle className="h-4 w-4 text-destructive" />}
                              {request.status === 'counter_offer' && <MessageSquare className="h-4 w-4 text-primary" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Loads */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Loads</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard/shipper/loads">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {loads.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No loads yet</h3>
                      <p className="text-muted-foreground mb-4">Post your first load to start finding carriers</p>
                      <Button variant="shipper" asChild>
                        <Link to="/dashboard/shipper/loads/new">
                          <Plus className="h-4 w-4" />
                          Post New Load
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {loads.map((load) => (
                        <div key={load.id} className="relative">
                          <BookmarkButton id={load.id} className="absolute top-3 right-3 z-10" />
                          <Link 
                            to={`/load/${load.id}`}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 pr-12 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Package className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {load.origin_city}, {load.origin_country} → {load.destination_city}, {load.destination_country}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {load.pallets} pallets · Pickup: {formatDateRange(load.pickup_date_from, load.pickup_date_to)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6">
                              <div className="text-right">
                                <div className="font-semibold text-foreground">
                                  {load.price ? `€${load.price}` : 'Open'}
                                </div>
                                <div className={`text-sm ${(load.offer_count || 0) > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                  {load.offer_count || 0} offer{(load.offer_count || 0) !== 1 ? 's' : ''}
                                </div>
                              </div>
                              <Badge className={statusConfig[load.status]?.className || ''}>
                                {statusConfig[load.status]?.label || load.status}
                              </Badge>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
