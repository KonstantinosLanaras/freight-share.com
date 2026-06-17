import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Package,
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  Calendar,
  CalendarClock,
  Euro,
  Search,
  Filter,
  Eye,
  Truck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Zap,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, parseISO, isValid } from 'date-fns';
import { checkCompatibility, type CargoType, type VehicleType, vehicleTypeLabels } from '@/lib/cargoVehicleCompatibility';
import { checkLoadRouteMatch } from '@/lib/matchingUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BookmarkButton } from '@/components/BookmarkButton';


interface Load {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  pallets: number;
  weight_kg: number;
  space_ldm: number | null;
  status: string;
  price: number | null;
  pricing_type: string;
  pickup_date_from: string;
  pickup_date_to: string;
  delivery_date_from: string | null;
  delivery_date_to: string | null;
  cargo_type: string;
  created_at: string;
  shipper_id: string;
}


interface CarrierRoute {
  id: string;
  vehicle_type: VehicleType | null;
  available_pallets: number;
  max_payload_kg: number;
  space_ldm: number | null;
}

export default function FindLoads() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [cargoFilter, setCargoFilter] = useState<string>('all');
  const [arriveBy, setArriveBy] = useState<string>('');
  const [flexibility, setFlexibility] = useState<string>('none');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [carrierRoute, setCarrierRoute] = useState<CarrierRoute | null>(null);
  const [showCompatibleOnly, setShowCompatibleOnly] = useState(false);
  const { user } = useAuth();


  useEffect(() => {
    fetchLoads();
    fetchCarrierRoute();
  }, [user]);

  const fetchCarrierRoute = async () => {
    if (!user) return;
    // Get carrier's most recent route with all capacity info
    const { data } = await supabase
      .from('routes')
      .select('id, vehicle_type, available_pallets, max_payload_kg, space_ldm')
      .eq('carrier_id', user.id)
      .in('status', ['planned', 'active'])
      .not('vehicle_type', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setCarrierRoute({
        id: data.id,
        vehicle_type: data.vehicle_type as VehicleType,
        available_pallets: data.available_pallets || 0,
        max_payload_kg: data.max_payload_kg || 0,
        space_ldm: data.space_ldm,
      });
    }
  };

  const fetchLoads = async () => {
    try {
      const { data, error } = await supabase
        .from('loads')
        .select('id, origin_city, origin_country, destination_city, destination_country, pallets, weight_kg, space_ldm, status, price, pricing_type, pickup_date_from, pickup_date_to, delivery_date_from, delivery_date_to, cargo_type, created_at, shipper_id')
        .eq('status', 'posted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoads(data || []);
    } catch (error) {
      console.error('Error fetching loads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check full compatibility for a load
  const getLoadCompatibility = (load: Load) => {
    if (!carrierRoute || !carrierRoute.vehicle_type) {
      return null;
    }
    
    return checkLoadRouteMatch(
      {
        cargoType: load.cargo_type as CargoType,
        pallets: load.pallets,
        weightKg: load.weight_kg || 0,
        spaceLdm: load.space_ldm || undefined,
      },
      {
        vehicleType: carrierRoute.vehicle_type,
        availablePallets: carrierRoute.available_pallets,
        maxPayloadKg: carrierRoute.max_payload_kg,
        spaceLdm: carrierRoute.space_ldm || undefined,
      }
    );
  };

  const filteredLoads = loads.filter(load => {
    const matchesOrigin = !searchOrigin || 
      load.origin_city.toLowerCase().includes(searchOrigin.toLowerCase()) ||
      load.origin_country.toLowerCase().includes(searchOrigin.toLowerCase());
    
    const matchesDestination = !searchDestination || 
      load.destination_city.toLowerCase().includes(searchDestination.toLowerCase()) ||
      load.destination_country.toLowerCase().includes(searchDestination.toLowerCase());
    
    const matchesCargo = cargoFilter === 'all' || load.cargo_type === cargoFilter;

    // Arrive-by filter with flexibility (+N days), or skip if no specification
    let matchesArriveBy = true;
    if (arriveBy && flexibility !== 'none') {
      const target = parseISO(arriveBy);
      if (isValid(target)) {
        const flex = parseInt(flexibility, 10) || 0;
        const cutoff = addDays(target, flex);
        const loadArrival = load.delivery_date_from
          ? parseISO(load.delivery_date_from)
          : parseISO(load.pickup_date_to);
        matchesArriveBy = isValid(loadArrival) && loadArrival <= cutoff;
      }
    }

    if (showCompatibleOnly && carrierRoute) {
      const compatibility = getLoadCompatibility(load);
      if (compatibility && !compatibility.isMatch) {
        return false;
      }
    }
    
    return matchesOrigin && matchesDestination && matchesCargo && matchesArriveBy;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': {
        const ap = a.price ?? Number.POSITIVE_INFINITY;
        const bp = b.price ?? Number.POSITIVE_INFINITY;
        return ap - bp;
      }
      case 'pickup_asc':
        return new Date(a.pickup_date_from).getTime() - new Date(b.pickup_date_from).getTime();
      case 'delivery_asc': {
        const ad = a.delivery_date_from || a.pickup_date_to;
        const bd = b.delivery_date_from || b.pickup_date_to;
        return new Date(ad).getTime() - new Date(bd).getTime();
      }
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });


  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (from === to) {
      return format(fromDate, 'MMM d, yyyy');
    }
    return `${format(fromDate, 'MMM d')} - ${format(toDate, 'd, yyyy')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard/carrier">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                  <Package className="h-6 w-6 text-primary" />
                  Browse Loads
                </h1>
                <p className="text-sm text-muted-foreground">Find available loads and propose to carry them</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Origin city or country"
                      className="pl-10"
                      value={searchOrigin}
                      onChange={(e) => setSearchOrigin(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Destination city or country"
                      className="pl-10"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={cargoFilter} onValueChange={setCargoFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Cargo type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All cargo types</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="fragile">Fragile</SelectItem>
                      <SelectItem value="refrigerated">Refrigerated</SelectItem>
                      <SelectItem value="hazardous">Hazardous</SelectItem>
                      <SelectItem value="oversized">Oversized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Arrive by</label>
                  <div className="relative">
                    <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-10"
                      value={arriveBy}
                      onChange={(e) => setArriveBy(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Flexibility</label>
                  <Select value={flexibility} onValueChange={setFlexibility}>
                    <SelectTrigger>
                      <Zap className="h-4 w-4 mr-2 text-primary" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specification</SelectItem>
                      <SelectItem value="0">Exact date</SelectItem>
                      <SelectItem value="1">+1 day</SelectItem>
                      <SelectItem value="2">+2 days</SelectItem>
                      <SelectItem value="3">+3 days</SelectItem>
                      <SelectItem value="7">+1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-56">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort by</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="price_asc">Price: low to high</SelectItem>
                      <SelectItem value="pickup_asc">Departure date</SelectItem>
                      <SelectItem value="delivery_asc">Arrival date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(arriveBy || sortBy !== 'newest' || flexibility !== 'none') && (
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setArriveBy(''); setFlexibility('none'); setSortBy('newest'); }}
                    >
                      Reset
                    </Button>
                  </div>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredLoads.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No loads found</h3>
              <p className="text-muted-foreground">
                {searchOrigin || searchDestination || cargoFilter !== 'all'
                  ? 'Try adjusting your search filters'
                  : 'Check back later for new load postings'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              {filteredLoads.length} load{filteredLoads.length !== 1 ? 's' : ''} available
            </div>
            {filteredLoads.map((load) => {
              const compatibility = getLoadCompatibility(load);
              const isIncompatible = compatibility && !compatibility.isMatch;
              
              return (
                <Card key={load.id} className={`relative hover:shadow-md transition-shadow ${isIncompatible ? 'border-destructive/30 opacity-75' : ''}`}>
                  <BookmarkButton id={load.id} className="absolute top-3 right-3 z-10" />
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-primary/10 text-primary">
                            {load.cargo_type}
                          </Badge>
                          {compatibility && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  {compatibility.isMatch ? (
                                    <Badge variant="outline" className="text-success border-success/50 bg-success/10">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Eligible
                                    </Badge>
                                  ) : !compatibility.isCompatible ? (
                                    <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/10">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Incompatible
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Insufficient
                                    </Badge>
                                  )}
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  {compatibility.isMatch ? (
                                    <span className="text-success">✓ Your route can carry this load</span>
                                  ) : (
                                    <div>
                                      <div className="font-medium text-destructive mb-1">Cannot match:</div>
                                      <ul className="text-xs space-y-0.5">
                                        {compatibility.reasons.map((r, i) => (
                                          <li key={i}>• {r}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <span className="text-sm text-muted-foreground">
                            Posted {format(new Date(load.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-lg font-medium text-foreground mb-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span>{load.origin_city}, {load.origin_country}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span>{load.destination_city}, {load.destination_country}</span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {load.pallets} pallets
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Pickup: {formatDateRange(load.pickup_date_from, load.pickup_date_to)}
                          </div>
                          {load.delivery_date_from && (
                            <div className="flex items-center gap-1">
                              <CalendarClock className="h-4 w-4" />
                              Deliver by: {formatDateRange(load.delivery_date_from, load.delivery_date_to || load.delivery_date_from)}
                            </div>
                          )}

                          {load.weight_kg > 0 && (
                            <div className="flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              {load.weight_kg} kg
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">
                            {load.price ? `€${load.price}` : 'Open to offers'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {load.pricing_type === 'fixed' ? 'Fixed price' : 'Accepting offers'}
                          </div>
                        </div>
                        {isIncompatible ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" disabled className="cursor-not-allowed">
                                  <Lock className="h-4 w-4 mr-2" />
                                  Cannot Propose
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Your vehicle/capacity is not compatible with this load
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Button variant="carrier" asChild>
                            <Link to={`/load/${load.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View & Propose
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
