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
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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
}

interface Profile {
  full_name: string | null;
  company_name: string | null;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, pending: 0, completed: 0, totalSpent: 0 });
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
        .select('full_name, company_name')
        .eq('id', user.id)
        .maybeSingle();
      
      setProfile(profileData);

      // Fetch loads
      const { data: loadsData, error } = await supabase
        .from('loads')
        .select('*')
        .eq('shipper_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLoads(loadsData || []);

      // Calculate stats
      const allLoads = loadsData || [];
      const active = allLoads.filter(l => ['posted', 'accepted', 'paid', 'picked_up'].includes(l.status)).length;
      const completed = allLoads.filter(l => l.status === 'completed').length;
      const totalSpent = allLoads
        .filter(l => l.status === 'completed' && l.price)
        .reduce((sum, l) => sum + (l.price || 0), 0);

      // Count pending offers (would need to join with offers table)
      setStats({ active, pending: 0, completed, totalSpent });
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-shipper/20 rounded-full text-shipper-foreground text-sm">
              <Package className="h-4 w-4" />
              Shipper
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <Link 
              to="/dashboard/shipper"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <TrendingUp className="h-5 w-5" />
              Dashboard
            </Link>
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
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-5 w-5 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || 'User'}
                </div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {profile?.company_name || user?.email}
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
                    Good morning, {firstName}! 👋
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
                        <div 
                          key={load.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
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
                              <div className="text-sm text-muted-foreground">0 offers</div>
                            </div>
                            <Badge className={statusConfig[load.status]?.className || ''}>
                              {statusConfig[load.status]?.label || load.status}
                            </Badge>
                          </div>
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
