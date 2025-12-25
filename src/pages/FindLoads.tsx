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
  Euro,
  Search,
  Filter,
  Eye,
  Truck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { checkCompatibility, type CargoType, type VehicleType, vehicleTypeLabels } from '@/lib/cargoVehicleCompatibility';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Load {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  pallets: number;
  status: string;
  price: number | null;
  pricing_type: string;
  pickup_date_from: string;
  pickup_date_to: string;
  cargo_type: string;
  created_at: string;
  shipper_id: string;
}

interface CarrierProfile {
  id: string;
  company_name: string | null;
  verification_status: string | null;
}

export default function FindLoads() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [cargoFilter, setCargoFilter] = useState<string>('all');
  const [carrierVehicleType, setCarrierVehicleType] = useState<VehicleType | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchLoads();
    fetchCarrierVehicle();
  }, [user]);

  const fetchCarrierVehicle = async () => {
    if (!user) return;
    // Get carrier's most recent route vehicle type
    const { data } = await supabase
      .from('routes')
      .select('vehicle_type')
      .eq('carrier_id', user.id)
      .not('vehicle_type', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data?.vehicle_type) {
      setCarrierVehicleType(data.vehicle_type as VehicleType);
    }
  };

  const fetchLoads = async () => {
    try {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
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

  const filteredLoads = loads.filter(load => {
    const matchesOrigin = !searchOrigin || 
      load.origin_city.toLowerCase().includes(searchOrigin.toLowerCase()) ||
      load.origin_country.toLowerCase().includes(searchOrigin.toLowerCase());
    
    const matchesDestination = !searchDestination || 
      load.destination_city.toLowerCase().includes(searchDestination.toLowerCase()) ||
      load.destination_country.toLowerCase().includes(searchDestination.toLowerCase());
    
    const matchesCargo = cargoFilter === 'all' || load.cargo_type === cargoFilter;
    
    return matchesOrigin && matchesDestination && matchesCargo;
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
              const cargoType = load.cargo_type as CargoType;
              const compatibility = carrierVehicleType 
                ? checkCompatibility(cargoType, carrierVehicleType) 
                : null;
              
              return (
                <Card key={load.id} className={`hover:shadow-md transition-shadow ${compatibility && !compatibility.compatible ? 'border-warning/50' : ''}`}>
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
                                  {compatibility.compatible ? (
                                    <Badge variant="outline" className="text-success border-success/50">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Compatible
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-warning border-warning/50">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Incompatible
                                    </Badge>
                                  )}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {compatibility.compatible 
                                    ? `Your ${vehicleTypeLabels[carrierVehicleType!]} can carry this cargo`
                                    : compatibility.note || 'Not compatible with your vehicle type'}
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
                      <Button variant="carrier" asChild>
                        <Link to={`/load/${load.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View & Propose
                        </Link>
                      </Button>
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
