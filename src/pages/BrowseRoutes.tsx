import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Calendar,
  Package,
  Truck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Search,
  Filter,
  Eye,
  Lock,
  Building2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { VerificationBadge } from '@/components/verification/VerificationBadge';

type RouteStatus = 'planned' | 'active' | 'completed' | 'cancelled';

interface Route {
  id: string;
  carrier_id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  available_pallets: number;
  departure_date_from: string;
  departure_date_to: string;
  arrival_date_from: string | null;
  arrival_date_to: string | null;
  status: RouteStatus;
  vehicle_constraints: string | null;
  notes: string | null;
  route_stops?: RouteStop[];
  carrier?: {
    company_name: string | null;
    verification_status: 'unverified' | 'pending' | 'verified' | 'rejected' | null;
  };
}

interface RouteStop {
  id: string;
  city: string;
  country: string;
  available_pallets: number;
  stop_order: number;
}

const countries = [
  'Netherlands', 'Germany', 'France', 'Belgium', 'Italy', 'Spain', 
  'Poland', 'Austria', 'Switzerland', 'Czech Republic', 'Denmark', 'Sweden',
  'Portugal', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Croatia'
];

export default function BrowseRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    originCountry: '',
    destinationCountry: '',
    minPallets: '',
    dateFrom: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      // Fetch routes with stops - show all planned/active routes
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select(`*, route_stops (*)`)
        .in('status', ['planned', 'active'])
        .order('departure_date_from', { ascending: false });

      if (routesError) throw routesError;

      // Fetch carrier profiles separately
      const carrierIds = [...new Set(routesData?.map(r => r.carrier_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, company_name, verification_status')
        .in('id', carrierIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      const routesWithCarriers = routesData?.map(route => ({
        ...route,
        carrier: profilesMap.get(route.carrier_id) || null
      })) || [];

      setRoutes(routesWithCarriers as Route[]);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter(route => {
    if (filters.originCountry && route.origin_country !== filters.originCountry) {
      // Also check stops
      const hasStopInOrigin = route.route_stops?.some(s => s.country === filters.originCountry);
      if (!hasStopInOrigin) return false;
    }
    if (filters.destinationCountry && route.destination_country !== filters.destinationCountry) {
      // Also check stops
      const hasStopInDest = route.route_stops?.some(s => s.country === filters.destinationCountry);
      if (!hasStopInDest) return false;
    }
    if (filters.minPallets && route.available_pallets < parseInt(filters.minPallets)) return false;
    if (filters.dateFrom && route.departure_date_to < filters.dateFrom) return false;
    return true;
  });

  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (from === to) {
      return format(fromDate, 'MMM d, yyyy');
    }
    return `${format(fromDate, 'MMM d')} - ${format(toDate, 'd, yyyy')}`;
  };

  const clearFilters = () => {
    setFilters({
      originCountry: '',
      destinationCountry: '',
      minPallets: '',
      dateFrom: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to={user ? "/dashboard/shipper" : "/"}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-heading font-bold text-foreground">Carrier Routes</h1>
                <p className="text-sm text-muted-foreground">Browse carriers who have shared their upcoming routes</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? 'border-primary' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 justify-center">
                  {Object.values(filters).filter(v => v !== '').length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Origin Country</Label>
                  <Select
                    value={filters.originCountry}
                    onValueChange={(value) => setFilters({ ...filters, originCountry: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Any country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Destination Country</Label>
                  <Select
                    value={filters.destinationCountry}
                    onValueChange={(value) => setFilters({ ...filters, destinationCountry: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Any country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Min. Pallets Needed</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g., 5"
                    className="mt-1"
                    value={filters.minPallets}
                    onChange={(e) => setFilters({ ...filters, minPallets: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Departure From</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Login Prompt for Unauthenticated Users */}
        {!user && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary" />
                <p className="text-sm text-foreground">
                  Sign in to see carrier details and contact them directly
                </p>
              </div>
              <Button variant="default" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Routes List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredRoutes.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No routes found</h2>
              <p className="text-muted-foreground mb-6">
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more results."
                  : "There are no available routes at the moment. Check back later!"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              {filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''} available
            </div>

            {filteredRoutes.map((route) => (
              <Card key={route.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Carrier Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-carrier/10 flex items-center justify-center">
                          {user ? (
                            <Building2 className="h-5 w-5 text-carrier" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          {user ? (
                            <>
                              <div className="font-medium text-foreground flex items-center gap-2">
                                {route.carrier?.company_name || 'Carrier'}
                                {route.carrier?.verification_status && (
                                  <VerificationBadge status={route.carrier.verification_status} size="sm" />
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="font-medium text-muted-foreground">
                              Sign in to see carrier details
                            </div>
                          )}
                        </div>
                        {route.vehicle_constraints && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            <Truck className="h-3 w-3 mr-1" />
                            {route.vehicle_constraints}
                          </Badge>
                        )}
                      </div>

                      {/* Route Path */}
                      <div className="flex items-center gap-2 text-lg font-medium text-foreground mb-4">
                        <MapPin className="h-5 w-5 text-carrier" />
                        <span>{route.origin_city}, {route.origin_country}</span>
                        {route.route_stops && route.route_stops.length > 0 && (
                          <>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              via {route.route_stops.length} stop{route.route_stops.length > 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span>{route.destination_city}, {route.destination_country}</span>
                      </div>

                      {/* Route Details */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateRange(route.departure_date_from, route.departure_date_to)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Package className="h-4 w-4 text-primary" />
                          <span>{route.available_pallets} pallets available</span>
                        </div>
                      </div>

                      {/* Stops */}
                      {route.route_stops && route.route_stops.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="text-xs text-muted-foreground mb-2">Can pick up / drop off at:</div>
                          <div className="flex flex-wrap gap-2">
                            {route.route_stops
                              .sort((a, b) => a.stop_order - b.stop_order)
                              .map((stop) => (
                                <Badge key={stop.id} variant="secondary" className="text-xs">
                                  {stop.city}, {stop.country}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:ml-4">
                      {user ? (
                        <Button variant="carrier" asChild>
                          <Link to={`/routes/${route.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" asChild>
                          <Link to="/auth">
                            <Lock className="h-4 w-4 mr-2" />
                            Sign in to Contact
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}