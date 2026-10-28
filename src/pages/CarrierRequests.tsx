import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ArrowLeft, MapPin, Package, Loader2, Clock, ArrowRight, Inbox, Shuffle, Euro, Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { carrierRequestsLastViewedKey } from '@/hooks/useCarrierRequestsUnread';

const requestStatusConfig: Record<string, { label: string; color: string }> = {
  sent: { label: 'New', color: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
  viewed: { label: 'Viewed', color: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
  in_discussion: { label: 'In Discussion', color: 'bg-primary/10 text-primary' },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300' },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
};

const todayIso = () => new Date().toISOString().split('T')[0];

const amber = 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300';

const offerStatusLabel = (isAccepted: boolean, pickupDateTo?: string, isPaid?: boolean, isCompleted?: boolean) => {
  if (isCompleted) return { label: 'Completed', color: 'bg-success/10 text-success' };
  if (pickupDateTo && pickupDateTo < todayIso()) {
    return { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300' };
  }
  if (isAccepted && isPaid) return { label: 'Accepted / In Transit', color: amber };
  return { label: 'Pending', color: amber };
};

const requestStatusLabel = (req: any) => {
  if (req.shipment_date && req.shipment_date < todayIso()) {
    return { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300' };
  }
  return requestStatusConfig[req.status] || requestStatusConfig.sent;
};

export default function CarrierRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAll();
      // Clear the "Offers & Requests" unread badge
      localStorage.setItem(carrierRequestsLastViewedKey(user.id), String(Date.now()));
    }
  }, [user]);

  const fetchAll = async () => {
    try {
      const [requestsRes, offersRes] = await Promise.all([
        supabase
          .from('route_requests')
          .select('*')
          .eq('carrier_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('offers')
          .select('*, loads(origin_city, destination_city, pickup_date_from, pickup_date_to, cargo_type)')
          .eq('carrier_id', user!.id)
          .order('created_at', { ascending: false }),
      ]);

      // Enrich route requests
      const data = requestsRes.data || [];
      const routeIds = [...new Set(data.map(r => r.route_id))];
      const shipperIds = [...new Set(data.map(r => r.shipper_id))];
      const [routesRes, profilesRes] = await Promise.all([
        routeIds.length ? supabase.from('routes').select('id, origin_city, destination_city').in('id', routeIds) : Promise.resolve({ data: [] }),
        shipperIds.length ? supabase.from('public_profiles').select('id, full_name, company_name').in('id', shipperIds) : Promise.resolve({ data: [] }),
      ]);
      const routeMap = new Map(routesRes.data?.map(r => [r.id, r]) || []);
      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);

      setRequests(data.map(r => ({
        ...r,
        route: routeMap.get(r.route_id),
        shipper: profileMap.get(r.shipper_id),
      })));

      const offersData = offersRes.data || [];
      const offerIds = offersData.map((o: any) => o.id);
      const { data: shipmentsData } = offerIds.length
        ? await supabase.from('shipments').select('offer_id, payment_status, status').in('offer_id', offerIds)
        : { data: [] as any[] };
      const shipmentMap = new Map((shipmentsData || []).map((s: any) => [s.offer_id, s]));

      setOffers(offersData.map((o: any) => ({
        ...o,
        shipment: shipmentMap.get(o.id) || null,
      })));
    } catch {
      // errors handled by empty state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/carrier')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">My Offers</h1>
              <p className="text-sm text-muted-foreground">Offers you've made on loads and incoming route requests</p>
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
          <Tabs defaultValue="offers">
            <TabsList className="mb-6">
              <TabsTrigger value="offers" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                My Offers
                {offers.filter(o => !o.is_accepted).length > 0 && (
                  <Badge className="ml-1 bg-primary text-primary-foreground text-xs h-4 px-1.5">
                    {offers.filter(o => !o.is_accepted).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Route Requests
                {requests.filter(r => r.status === 'sent').length > 0 && (
                  <Badge className="ml-1 bg-primary text-primary-foreground text-xs h-4 px-1.5">
                    {requests.filter(r => r.status === 'sent').length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* My Offers tab */}
            <TabsContent value="offers">
              {offers.length === 0 ? (
                <Card className="max-w-lg mx-auto">
                  <CardContent className="text-center py-12">
                    <Send className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold mb-2">No offers made yet</h2>
                    <p className="text-muted-foreground mb-4">Browse available loads and make your first offer.</p>
                    <Button asChild variant="carrier">
                      <Link to="/dashboard/carrier/find-loads">Browse Loads</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {offers.map((offer) => {
                    const isPaid = offer.shipment?.payment_status === 'paid' || offer.shipment?.payment_status === 'completed';
                    const isCompleted = offer.shipment?.status === 'completed' || offer.shipment?.status === 'delivered';
                    const s = offerStatusLabel(offer.is_accepted, offer.loads?.pickup_date_to, isPaid, isCompleted);
                    return (
                      <Card
                        key={offer.id}
                        className={`hover:shadow-md transition-shadow cursor-pointer${s.label === 'Expired' ? ' opacity-60' : ''}`}
                        onClick={() => navigate(`/load/${offer.load_id}`)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={s.color}>{s.label}</Badge>
                              </div>
                              {offer.loads && (
                                <div className="flex items-center gap-2 text-sm text-foreground mb-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {offer.loads.origin_city} → {offer.loads.destination_city}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                {offer.loads?.pickup_date_from && (
                                  <span className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {offer.loads.cargo_type} · {format(new Date(offer.loads.pickup_date_from), 'MMM d')}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-foreground font-medium">
                                  <Euro className="h-3 w-3" /> €{Number(offer.price).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {format(new Date(offer.created_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                              {offer.message && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-1 italic">"{offer.message}"</p>
                              )}
                            </div>
                            <Button size="sm" variant="outline" className="flex-shrink-0 mt-1 gap-1.5">
                              View Load <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Route Requests tab */}
            <TabsContent value="requests">
              {requests.length === 0 ? (
                <Card className="max-w-lg mx-auto">
                  <CardContent className="text-center py-12">
                    <Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold mb-2">No incoming requests</h2>
                    <p className="text-muted-foreground">When shippers request space on your routes, they'll appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => {
                    const st = requestStatusLabel(req);
                    const isExpired = st.label === 'Expired';
                    return (
                      <Card
                        key={req.id}
                        className={`hover:shadow-md transition-shadow cursor-pointer ${req.status === 'sent' && !isExpired ? 'border-l-4 border-l-amber-400' : ''}${isExpired || ['cancelled', 'rejected'].includes(req.status) ? ' opacity-60' : ''}`}
                        onClick={() => navigate(`/dashboard/carrier/requests/${req.id}`)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Link
                                  to={`/profile/shipper/${req.shipper_id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-medium text-foreground hover:underline"
                                >
                                  {req.shipper?.company_name || req.shipper?.full_name || 'Shipper'}
                                </Link>
                                <Badge className={st.color}>{st.label}</Badge>
                                {req.offer_type === 'alternative' ? (
                                  <Badge variant="outline" className="text-xs border-success/40 text-success">
                                    <Shuffle className="h-3 w-3 mr-1" />
                                    Alternative Stop
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                    Direct Bid
                                  </Badge>
                                )}
                              </div>
                              {req.route && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {req.route.origin_city} → {req.route.destination_city}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {req.pallets} pallets · {req.goods_type}</span>
                                {req.offer_price && (
                                  <span className="flex items-center gap-1 text-foreground font-medium"><Euro className="h-3 w-3" /> €{Number(req.offer_price).toLocaleString()}</span>
                                )}
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(req.created_at), 'MMM d, HH:mm')}</span>
                              </div>
                            </div>
                            <Button size="sm" variant={req.status === 'sent' ? 'default' : 'outline'} className="flex-shrink-0 mt-1 gap-1.5">
                              {req.status === 'sent' ? 'Review' : 'View'} <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
