import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus,
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  Calendar,
  Euro,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Download,
  Printer
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { exportLoadsToCSV, printLoads } from '@/lib/exportUtils';

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
  notes: string | null;
  offer_count?: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  posted: { label: 'Posted', color: 'bg-blue-100 text-blue-800' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800' },
  picked_up: { label: 'Picked Up', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-success text-success-foreground' },
  completed: { label: 'Completed', color: 'bg-success text-success-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive' },
};

export default function ShipperLoads() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchLoads();
    }
  }, [user]);

  const fetchLoads = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('shipper_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch offer counts
      const loadIds = (data || []).map(l => l.id);
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

      setLoads((data || []).map(l => ({ ...l, offer_count: offerCountMap[l.id] || 0 })));
    } catch (error) {
      console.error('Error fetching loads:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLoad = async (loadId: string) => {
    try {
      const { error } = await supabase
        .from('loads')
        .delete()
        .eq('id', loadId);

      if (error) throw error;
      setLoads(loads.filter(l => l.id !== loadId));
      toast.success('Load deleted');
    } catch (error) {
      console.error('Error deleting load:', error);
      toast.error('Failed to delete load');
    }
  };

  const draftLoads = loads.filter(l => l.status === 'draft');
  const activeLoads = loads.filter(l => ['posted', 'accepted'].includes(l.status));
  const pastLoads = loads.filter(l => ['paid', 'picked_up', 'delivered', 'completed', 'cancelled'].includes(l.status));

  const handleExportCSV = () => {
    const exportData = pastLoads.map(load => ({
      ...load,
      delivery_date_from: load.pickup_date_from,
      delivery_date_to: load.pickup_date_to,
    }));
    exportLoadsToCSV(exportData);
    toast.success('Loads exported to CSV');
  };

  const handlePrint = () => {
    const exportData = pastLoads.map(load => ({
      ...load,
      delivery_date_from: load.pickup_date_from,
      delivery_date_to: load.pickup_date_to,
    }));
    printLoads(exportData);
  };

  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (from === to) {
      return format(fromDate, 'MMM d, yyyy');
    }
    return `${format(fromDate, 'MMM d')} - ${format(toDate, 'd, yyyy')}`;
  };

  const renderLoadCard = (load: Load, showActions = true) => {
    const status = statusConfig[load.status] || statusConfig.posted;

    return (
      <Link key={load.id} to={`/load/${load.id}`} className="block">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={status.color}>{status.label}</Badge>
                  {(load.offer_count || 0) > 0 && load.status === 'posted' && (
                    <Badge className="bg-primary/10 text-primary border-primary/30" variant="outline">
                      {load.offer_count} offer{load.offer_count !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(load.created_at), 'MMM d, yyyy')}
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
                    {load.pallets} pallets · {load.cargo_type}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Pickup: {formatDateRange(load.pickup_date_from, load.pickup_date_to)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {load.price ? `€${load.price}` : 'Open'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {load.pricing_type === 'fixed' ? 'Fixed price' : 'Open to offers'}
                  </div>
                </div>

                {showActions && load.status === 'posted' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => { e.preventDefault(); navigate(`/dashboard/shipper/loads/${load.id}/edit`); }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Load
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => { e.preventDefault(); deleteLoad(load.id); }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Load
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
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
                <h1 className="text-xl font-heading font-bold text-foreground">My Loads</h1>
                <p className="text-sm text-muted-foreground">Manage your posted loads</p>
              </div>
            </div>
            <Button variant="accent" asChild>
              <Link to="/dashboard/shipper/loads/new">
                <Plus className="h-4 w-4" />
                Post New Load
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
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="draft" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Draft ({draftLoads.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Active ({activeLoads.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Past ({pastLoads.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draft">
              {draftLoads.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No drafts</h3>
                    <p className="text-muted-foreground">Draft loads will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {draftLoads.map(load => renderLoadCard(load))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active">
              {activeLoads.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No active loads</h3>
                    <p className="text-muted-foreground mb-4">Post a load to start finding carriers</p>
                    <Button variant="accent" asChild>
                      <Link to="/dashboard/shipper/loads/new">
                        <Plus className="h-4 w-4" />
                        Post New Load
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeLoads.map(load => renderLoadCard(load))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastLoads.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No past loads</h3>
                    <p className="text-muted-foreground">Completed and cancelled loads will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {pastLoads.map(load => renderLoadCard(load, false))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}