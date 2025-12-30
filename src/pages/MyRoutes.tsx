import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  MapPin, 
  Calendar,
  Package,
  Truck,
  ArrowLeft,
  MoreVertical,
  Edit,
  Pause,
  Play,
  Trash2,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
  arrival_date_from: string | null;
  arrival_date_to: string | null;
  status: RouteStatus;
  vehicle_constraints: string | null;
  notes: string | null;
  created_at: string;
  route_stops?: RouteStop[];
  matched_loads_count?: number;
}

interface RouteStop {
  id: string;
  city: string;
  country: string;
  available_pallets: number;
  stop_order: number;
}

const statusConfig: Record<RouteStatus, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  planned: { label: 'Planned', icon: Clock, variant: 'secondary' },
  active: { label: 'Active', icon: Play, variant: 'default' },
  completed: { label: 'Completed', icon: CheckCircle, variant: 'outline' },
  cancelled: { label: 'Cancelled', icon: XCircle, variant: 'destructive' },
};

export default function MyRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchRoutes();
    }
  }, [user]);

  const fetchRoutes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          route_stops (*)
        `)
        .eq('carrier_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes((data as Route[]) || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const updateRouteStatus = async (routeId: string, newStatus: RouteStatus) => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({ status: newStatus })
        .eq('id', routeId);

      if (error) throw error;

      setRoutes(routes.map(r => 
        r.id === routeId ? { ...r, status: newStatus } : r
      ));
      toast.success(`Route ${newStatus === 'active' ? 'activated' : newStatus}`);
    } catch (error) {
      console.error('Error updating route:', error);
      toast.error('Failed to update route');
    }
  };

  const deleteRoute = async () => {
    if (!routeToDelete) return;

    try {
      // First delete route stops
      await supabase
        .from('route_stops')
        .delete()
        .eq('route_id', routeToDelete);

      // Then delete the route
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeToDelete);

      if (error) throw error;

      setRoutes(routes.filter(r => r.id !== routeToDelete));
      toast.success('Route deleted');
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Failed to delete route');
    } finally {
      setDeleteDialogOpen(false);
      setRouteToDelete(null);
    }
  };

  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (from === to) {
      return format(fromDate, 'MMM d, yyyy');
    }
    return `${format(fromDate, 'MMM d')} - ${format(toDate, 'd, yyyy')}`;
  };

  const getStatusBadge = (status: RouteStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const activeRoutes = routes.filter(r => r.status === 'planned' || r.status === 'active');
  const completedRoutes = routes.filter(r => r.status === 'completed' || r.status === 'cancelled');

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
                <h1 className="text-xl font-heading font-bold text-foreground">My Routes</h1>
                <p className="text-sm text-muted-foreground">Manage your planned journeys</p>
              </div>
            </div>
            <Button variant="carrier" asChild>
              <Link to="/dashboard/carrier/routes/new">
                <Plus className="h-4 w-4" />
                Post New Route
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : routes.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No routes yet</h2>
              <p className="text-muted-foreground mb-6">
                Post your first route to start getting matched with loads along your journey.
              </p>
              <Button variant="carrier" asChild>
                <Link to="/dashboard/carrier/routes/new">
                  <Plus className="h-4 w-4" />
                  Post Your First Route
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Routes */}
            {activeRoutes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Play className="h-5 w-5 text-carrier" />
                  Active & Planned Routes ({activeRoutes.length})
                </h2>
                <div className="grid gap-4">
                  {activeRoutes.map((route) => {
                    const today = new Date().toISOString().split('T')[0];
                    const isDepartureDue = route.status === 'planned' && route.departure_date_to < today;
                    const isArrivalDue = route.status === 'active' && route.arrival_date_to && route.arrival_date_to < today;
                    
                    return (
                      <Card key={route.id} className={`hover:shadow-md transition-shadow ${isDepartureDue || isArrivalDue ? 'border-warning' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  {getStatusBadge(route.status)}
                                  {route.vehicle_constraints && (
                                    <Badge variant="outline" className="text-xs">
                                      <Truck className="h-3 w-3 mr-1" />
                                      {route.vehicle_constraints}
                                    </Badge>
                                  )}
                                  {isDepartureDue && (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Departure overdue
                                    </Badge>
                                  )}
                                  {isArrivalDue && (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Arrival overdue
                                    </Badge>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => navigate(`/route/${route.id}`)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/dashboard/carrier/routes/${route.id}/edit`)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Route
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => updateRouteStatus(route.id, 'cancelled')} className="text-warning">
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Cancel Route
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        setRouteToDelete(route.id);
                                        setDeleteDialogOpen(true);
                                      }}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Route
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {/* Route Path */}
                              <div className="flex items-center gap-2 text-lg font-medium text-foreground mb-4">
                                <span>{route.origin_city}, {route.origin_country}</span>
                                {route.route_stops && route.route_stops.length > 0 && (
                                  <>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {route.route_stops.length} stop{route.route_stops.length > 1 ? 's' : ''}
                                    </span>
                                  </>
                                )}
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <span>{route.destination_city}, {route.destination_country}</span>
                              </div>

                              {/* Route Details */}
                              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>Departure: {formatDateRange(route.departure_date_from, route.departure_date_to)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Package className="h-4 w-4" />
                                  <span>{route.available_pallets} pallets available</span>
                                </div>
                                {route.arrival_date_from && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Arrival: {formatDateRange(route.arrival_date_from, route.arrival_date_to || route.arrival_date_from)}</span>
                                  </div>
                                )}
                              </div>

                              {/* Stops */}
                              {route.route_stops && route.route_stops.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <div className="text-sm text-muted-foreground mb-2">Intermediate stops:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {route.route_stops
                                      .sort((a, b) => a.stop_order - b.stop_order)
                                      .map((stop) => (
                                        <Badge key={stop.id} variant="secondary" className="text-xs">
                                          {stop.city}, {stop.country} ({stop.available_pallets} available pallets)
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {route.notes && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <p className="text-sm text-muted-foreground">{route.notes}</p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 lg:ml-4 shrink-0">
                              {route.status === 'planned' && (
                                <Button 
                                  variant={isDepartureDue ? "destructive" : "carrier"}
                                  size="sm"
                                  onClick={() => updateRouteStatus(route.id, 'active')}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Confirm Departure
                                </Button>
                              )}
                              {route.status === 'active' && (
                                <Button 
                                  variant={isArrivalDue ? "destructive" : "default"}
                                  size="sm"
                                  onClick={() => updateRouteStatus(route.id, 'completed')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm Arrival
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed/Cancelled Routes */}
            {completedRoutes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  Past Routes ({completedRoutes.length})
                </h2>
                <div className="grid gap-4 opacity-75">
                  {completedRoutes.map((route) => (
                    <Card key={route.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusBadge(route.status)}
                            </div>
                            <div className="text-lg font-medium text-foreground">
                              {route.origin_city}, {route.origin_country} → {route.destination_city}, {route.destination_country}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatDateRange(route.departure_date_from, route.departure_date_to)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRouteToDelete(route.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
    </div>
  );
}