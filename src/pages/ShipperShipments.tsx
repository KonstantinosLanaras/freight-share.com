import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Truck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  Calendar,
  Euro,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Shipment {
  id: string;
  status: string;
  payment_status: string;
  final_price: number;
  created_at: string;
  load: {
    origin_city: string;
    origin_country: string;
    destination_city: string;
    destination_country: string;
    pallets: number;
    pickup_date_from: string;
    pickup_date_to: string;
  };
  carrier: {
    company_name: string | null;
  };
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  accepted: { label: 'Accepted', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Paid', icon: Euro, color: 'bg-green-100 text-green-800' },
  picked_up: { label: 'Picked Up', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  in_transit: { label: 'In Transit', icon: Truck, color: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-success text-success-foreground' },
  cancelled: { label: 'Cancelled', icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
  disputed: { label: 'Disputed', icon: AlertTriangle, color: 'bg-warning text-warning-foreground' },
};

export default function ShipperShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user]);

  const fetchShipments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          id,
          status,
          payment_status,
          final_price,
          created_at,
          load_id,
          carrier_id
        `)
        .eq('shipper_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related load and carrier data
      if (data && data.length > 0) {
        const loadIds = data.map(s => s.load_id);
        const carrierIds = data.map(s => s.carrier_id);

        const [loadsResult, profilesResult] = await Promise.all([
          supabase.from('loads').select('id, origin_city, origin_country, destination_city, destination_country, pallets, pickup_date_from, pickup_date_to').in('id', loadIds),
          supabase.from('profiles').select('id, company_name').in('id', carrierIds)
        ]);

        const loadsMap = new Map(loadsResult.data?.map(l => [l.id, l]) || []);
        const profilesMap = new Map(profilesResult.data?.map(p => [p.id, p]) || []);

        const enrichedShipments: Shipment[] = data.map(shipment => ({
          id: shipment.id,
          status: shipment.status,
          payment_status: shipment.payment_status,
          final_price: shipment.final_price,
          created_at: shipment.created_at,
          load: loadsMap.get(shipment.load_id) as Shipment['load'],
          carrier: profilesMap.get(shipment.carrier_id) as Shipment['carrier'],
        })).filter(s => s.load && s.carrier);

        setShipments(enrichedShipments);
      } else {
        setShipments([]);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeShipments = shipments.filter(s => 
    ['accepted', 'paid', 'picked_up', 'in_transit'].includes(s.status)
  );
  const completedShipments = shipments.filter(s => 
    ['delivered', 'completed'].includes(s.status)
  );
  const disputedShipments = shipments.filter(s => 
    ['cancelled', 'disputed'].includes(s.status)
  );

  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (from === to) {
      return format(fromDate, 'MMM d, yyyy');
    }
    return `${format(fromDate, 'MMM d')} - ${format(toDate, 'd, yyyy')}`;
  };

  const renderShipmentCard = (shipment: Shipment) => {
    const status = statusConfig[shipment.status] || statusConfig.accepted;
    const StatusIcon = status.icon;

    return (
      <Card key={shipment.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={status.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(shipment.created_at), 'MMM d, yyyy')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-lg font-medium text-foreground mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{shipment.load?.origin_city}, {shipment.load?.origin_country}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span>{shipment.load?.destination_city}, {shipment.load?.destination_country}</span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {shipment.load?.pallets} pallets
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {shipment.load?.pickup_date_from && formatDateRange(shipment.load.pickup_date_from, shipment.load.pickup_date_to)}
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  {shipment.carrier?.company_name || 'Carrier'}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">€{shipment.final_price}</div>
                <div className="text-sm text-muted-foreground">
                  Payment: {shipment.payment_status}
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/shipment/${shipment.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard/shipper">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-heading font-bold text-foreground">My Shipments</h1>
                <p className="text-sm text-muted-foreground">Track and manage your shipments</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Active ({activeShipments.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed ({completedShipments.length})
              </TabsTrigger>
              <TabsTrigger value="disputed" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Disputed / Cancelled ({disputedShipments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeShipments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Truck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No active shipments</h3>
                    <p className="text-muted-foreground mb-4">Your active shipments will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeShipments.map(renderShipmentCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedShipments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No completed shipments</h3>
                    <p className="text-muted-foreground">Completed shipments will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {completedShipments.map(renderShipmentCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="disputed">
              {disputedShipments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No disputes</h3>
                    <p className="text-muted-foreground">Disputed or cancelled shipments will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {disputedShipments.map(renderShipmentCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}