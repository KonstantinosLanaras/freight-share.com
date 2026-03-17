import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Package, 
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Edit,
  Trash2,
  ArrowRight,
  FileText,
  User,
  Loader2,
  Plus,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { vehicleTypeLabels } from '@/lib/cargoVehicleCompatibility';
import { DeviationRequestForm } from '@/components/routes/DeviationRequestForm';
import { InsuranceSummaryCard } from '@/components/insurance/InsuranceSummaryCard';
import { VerificationBadge } from '@/components/verification/VerificationBadge';

type RouteStatus = 'planned' | 'active' | 'completed' | 'cancelled';

interface RouteStop {
  id: string;
  city: string;
  country: string;
  available_pallets: number;
  stop_order: number;
}

interface Route {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  available_pallets: number;
  departure_date_from: string;
  departure_date_to: string;
  departure_time: string | null;
  arrival_date_from: string | null;
  arrival_date_to: string | null;
  status: RouteStatus;
  vehicle_type: string | null;
  vehicle_constraints: string | null;
  notes: string | null;
  open_to_extra_stops: boolean;
  flexibility_note: string | null;
  created_at: string;
  carrier_id: string;
  max_deviation_km: number | null;
  max_destination_radius_km: number | null;
  trip_description: string | null;
  itinerary_image_url: string | null;
  route_link: string | null;
  goods_accepted: string | null;
  route_stops?: RouteStop[];
}

const statusConfig: Record<RouteStatus, { label: string; icon: React.ElementType; color: string }> = {
  planned: { label: 'Planned', icon: Clock, color: 'bg-muted text-muted-foreground' },
  active: { label: 'Active', icon: Play, color: 'bg-primary/10 text-primary' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-destructive/10 text-destructive' },
};

export default function RouteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviationRequestOpen, setDeviationRequestOpen] = useState(false);
  const [carrierProfile, setCarrierProfile] = useState<{ full_name: string | null; company_name: string | null; verification_status: string | null } | null>(null);
  const [carrierInsurance, setCarrierInsurance] = useState<any>(null);
  useEffect(() => {
    if (id) {
      fetchRoute();
    }
  }, [id]);

  const fetchRoute = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          route_stops (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setRoute(data as Route);

      // Fetch carrier profile and insurance
      if (data?.carrier_id) {
        const [profileRes, insuranceRes] = await Promise.all([
          supabase.from('profiles').select('full_name, company_name, verification_status').eq('id', data.carrier_id).single(),
          supabase.from('carrier_insurance').select('*').eq('carrier_id', data.carrier_id).maybeSingle(),
        ]);
        setCarrierProfile(profileRes.data);
        setCarrierInsurance(insuranceRes.data);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      toast.error('Failed to load route details');
    } finally {
      setLoading(false);
    }
  };

  const updateRouteStatus = async (newStatus: RouteStatus) => {
    if (!route) return;

    try {
      const { error } = await supabase
        .from('routes')
        .update({ status: newStatus })
        .eq('id', route.id);

      if (error) throw error;

      setRoute({ ...route, status: newStatus });
      toast.success(`Route ${newStatus === 'active' ? 'activated' : newStatus}`);
    } catch (error) {
      console.error('Error updating route:', error);
      toast.error('Failed to update route');
    }
  };

  const deleteRoute = async () => {
    if (!route) return;

    try {
      // First delete route stops
      await supabase
        .from('route_stops')
        .delete()
        .eq('route_id', route.id);

      // Then delete the route
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', route.id);

      if (error) throw error;

      toast.success('Route deleted');
      navigate('/dashboard/carrier/routes');
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Failed to delete route');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (from === to) {
      return format(fromDate, 'EEEE, MMMM d, yyyy');
    }
    return `${format(fromDate, 'MMM d')} - ${format(toDate, 'd, yyyy')}`;
  };

  const isOwner = user?.id === route?.carrier_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Route not found</h2>
          <Button asChild>
            <Link to="/dashboard/carrier/routes">Back to My Routes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[route.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-heading font-bold text-foreground">
                    Route Details
                  </h1>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {route.origin_city} → {route.destination_city}
                </p>
              </div>
            </div>
            {isOwner && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Path */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Route Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-lg font-medium mb-6">
                  <div className="flex-1 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-sm text-muted-foreground mb-1">Origin</div>
                    <div className="text-foreground">{route.origin_city}, {route.origin_country}</div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-sm text-muted-foreground mb-1">Destination</div>
                    <div className="text-foreground">{route.destination_city}, {route.destination_country}</div>
                  </div>
                </div>

                {/* Intermediate Stops */}
                {route.route_stops && route.route_stops.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Intermediate Stops</h4>
                    <div className="space-y-2">
                      {route.route_stops
                        .sort((a, b) => a.stop_order - b.stop_order)
                        .map((stop, index) => (
                          <div key={stop.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">{stop.city}, {stop.country}</span>
                            </div>
                            <Badge variant="secondary">
                              {stop.available_pallets} available pallets
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Departure Window</div>
                    <div className="font-medium text-foreground">
                      {formatDateRange(route.departure_date_from, route.departure_date_to)}
                    </div>
                    {route.departure_time && (
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {route.departure_time}
                      </div>
                    )}
                  </div>
                  {route.arrival_date_from && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground mb-1">Arrival Window</div>
                      <div className="font-medium text-foreground">
                        {formatDateRange(route.arrival_date_from, route.arrival_date_to || route.arrival_date_from)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Capacity & Vehicle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Capacity & Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Available Capacity</div>
                    <div className="font-medium text-foreground flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      {route.available_pallets} pallets
                    </div>
                  </div>
                  {route.vehicle_type && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground mb-1">Vehicle Type</div>
                      <div className="font-medium text-foreground flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        {vehicleTypeLabels[route.vehicle_type as keyof typeof vehicleTypeLabels] || route.vehicle_type}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Route Tolerance */}
            {(route.max_deviation_km || route.max_destination_radius_km) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Route Tolerance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {route.max_deviation_km && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground mb-1">Max deviation from route</div>
                        <div className="font-medium text-foreground">{route.max_deviation_km} km</div>
                      </div>
                    )}
                    {route.max_destination_radius_km && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground mb-1">Delivery radius from {route.destination_city}</div>
                        <div className="font-medium text-foreground">{route.max_destination_radius_km} km</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trip Description */}
            {route.trip_description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Trip Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{route.trip_description}</p>
                </CardContent>
              </Card>
            )}

            {/* Itinerary Image */}
            {route.itinerary_image_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Planned Itinerary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img src={route.itinerary_image_url} alt="Route itinerary" className="w-full max-h-96 object-contain bg-muted" />
                  </div>
                  {route.route_link && (
                    <a href={route.route_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:underline">
                      <ArrowRight className="h-3 w-3" /> View Route Link
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Flexibility */}
            {route.open_to_extra_stops && (
              <Card className="border-success/30 bg-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-success" />
                    Open to Extra Stops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {route.flexibility_note && (
                    <p className="text-muted-foreground">{route.flexibility_note}</p>
                  )}
                  {!isOwner && user && route.available_pallets > 0 && (
                    <Button 
                      className="mt-4 w-full" 
                      onClick={() => setDeviationRequestOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request Pickup on This Route
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Request Load CTA for shippers */}
            {!isOwner && user && route.available_pallets > 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6 text-center">
                  <Package className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-foreground mb-2">Need space on this route?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Send a load request to the carrier with your shipment details.</p>
                  <Button asChild className="w-full">
                    <Link to={`/routes/${route.id}/request`}>
                      <Package className="h-4 w-4 mr-2" />
                      Request Load on This Route
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {route.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{route.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Carrier Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-primary" />
                  Carrier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-carrier/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-carrier" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {carrierProfile?.full_name || carrierProfile?.company_name || 'Carrier'}
                    </div>
                    {carrierProfile?.company_name && carrierProfile?.full_name && (
                      <div className="text-sm text-muted-foreground">{carrierProfile.company_name}</div>
                    )}
                  </div>
                </div>
                {carrierProfile?.verification_status && (
                  <div className="mt-3">
                    <VerificationBadge status={carrierProfile.verification_status as any} size="sm" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Carrier Insurance */}
            {!isOwner && (
              <InsuranceSummaryCard insurance={carrierInsurance} />
            )}

            {/* Quick Actions - Owner only */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {route.status === 'planned' && (
                    <Button
                      variant="default"
                      className="w-full justify-start"
                      onClick={() => updateRouteStatus('active')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Mark as Active
                    </Button>
                  )}
                  {route.status === 'active' && (
                    <>
                      <Button
                        variant="default"
                        className="w-full justify-start"
                        onClick={() => updateRouteStatus('completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => updateRouteStatus('planned')}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Route
                      </Button>
                    </>
                  )}
                  {(route.status === 'planned' || route.status === 'active') && (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-warning hover:text-warning"
                      onClick={() => updateRouteStatus('cancelled')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Route
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route ID</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{route.id.slice(0, 8)}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(route.created_at), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this route? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteRoute} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deviation Request Form */}
      {route && user && (
        <DeviationRequestForm
          open={deviationRequestOpen}
          onOpenChange={setDeviationRequestOpen}
          routeId={route.id}
          carrierId={route.carrier_id}
          shipperId={user.id}
          maxPallets={route.available_pallets}
          onSuccess={() => fetchRoute()}
        />
      )}
    </div>
  );
}
