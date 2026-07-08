import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import {
  ArrowLeft, MapPin, Package, Loader2, Clock, Euro,
  Shuffle, Handshake, ArrowRight, Inbox, Send,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { notifyOfferAccepted } from '@/lib/notify';
import { CounterpartyCard } from '@/components/profile/CounterpartyCard';

type StatusKey = 'pending' | 'accepted' | 'countered' | 'declined';

const statusPill: Record<StatusKey, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300',
  accepted: 'bg-success/15 text-success',
  countered: 'bg-primary/15 text-primary',
  declined: 'bg-muted text-muted-foreground',
};

const statusLabel: Record<StatusKey, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  countered: 'Countered',
  declined: 'Declined',
};

// Map route_request status -> normalized status
function mapRequestStatus(s: string): StatusKey {
  if (s === 'accepted') return 'accepted';
  if (s === 'in_discussion') return 'countered';
  if (s === 'rejected' || s === 'expired' || s === 'cancelled') return 'declined';
  return 'pending';
}

function mapOfferStatus(is_accepted: boolean, declined?: boolean): StatusKey {
  if (is_accepted) return 'accepted';
  if (declined) return 'declined';
  return 'pending';
}

export default function OffersShipper() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [made, setMade] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'made' | 'received'>('made');
  const [selected, setSelected] = useState<{ kind: 'made' | 'received'; data: any } | null>(null);
  const [lastViewed, setLastViewed] = useState<number>(0);

  const lastViewedKey = user ? `offers-shipper-last-viewed-${user.id}` : '';

  useEffect(() => {
    if (!user) return;
    setLastViewed(Number(localStorage.getItem(lastViewedKey) || 0));
    fetchData();
  }, [user]);

  // Mark viewed when leaving / after load
  useEffect(() => {
    return () => {
      if (lastViewedKey) localStorage.setItem(lastViewedKey, String(Date.now()));
    };
  }, [lastViewedKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Offers I've Made = route_requests where shipper_id = me
      const { data: reqs } = await supabase
        .from('route_requests')
        .select('*')
        .eq('shipper_id', user!.id)
        .order('created_at', { ascending: false });

      const routeIds = [...new Set((reqs || []).map((r: any) => r.route_id))];
      const { data: routes } = routeIds.length
        ? await supabase.from('routes')
            .select('id, origin_city, origin_country, destination_city, destination_country, carrier_id')
            .in('id', routeIds)
        : { data: [] as any[] };
      const routeMap = new Map((routes || []).map((r: any) => [r.id, r]));

      const carrierIds = [...new Set((reqs || []).map((r: any) => r.carrier_id))];
      const { data: carriers } = carrierIds.length
        ? await supabase.from('public_profiles')
            .select('id, full_name, company_name')
            .in('id', carrierIds)
        : { data: [] as any[] };
      const carrierMap = new Map((carriers || []).map((p: any) => [p.id, p]));

      setMade(
        (reqs || []).map((r: any) => ({
          ...r,
          route: routeMap.get(r.route_id),
          carrier: carrierMap.get(r.carrier_id),
        }))
      );

      // Offers Received = offers on my loads
      const { data: myLoads } = await supabase
        .from('loads')
        .select('id, origin_city, origin_country, destination_city, destination_country, pickup_date_from, pickup_date_to')
        .eq('shipper_id', user!.id);

      const loadIds = (myLoads || []).map((l: any) => l.id);
      const loadMap = new Map((myLoads || []).map((l: any) => [l.id, l]));

      const { data: rec } = loadIds.length
        ? await supabase.from('offers').select('*').in('load_id', loadIds).order('created_at', { ascending: false })
        : { data: [] as any[] };

      const recCarrierIds = [...new Set((rec || []).map((o: any) => o.carrier_id))];
      const { data: recCarriers } = recCarrierIds.length
        ? await supabase.from('public_profiles')
            .select('id, full_name, company_name')
            .in('id', recCarrierIds)
        : { data: [] as any[] };
      const recCarrierMap = new Map((recCarriers || []).map((p: any) => [p.id, p]));

      setReceived(
        (rec || []).map((o: any) => ({
          ...o,
          load: loadMap.get(o.load_id),
          carrier: recCarrierMap.get(o.carrier_id),
        }))
      );
    } catch (e) {
      console.error('fetch offers failed', e);
    } finally {
      setLoading(false);
    }
  };

  const unreadMade = useMemo(
    () => made.filter((r) => new Date(r.updated_at).getTime() > lastViewed && r.status !== 'sent').length,
    [made, lastViewed]
  );
  const unreadReceived = useMemo(
    () => received.filter((o) => new Date(o.created_at).getTime() > lastViewed).length,
    [received, lastViewed]
  );

  const acceptOfferReceived = async (offerId: string) => {
    const offer = received.find((o) => o.id === offerId);
    const { error } = await supabase.from('offers').update({ is_accepted: true }).eq('id', offerId);
    if (error) return toast.error('Failed to accept offer');
    if (offer?.carrier_id) {
      const load = offer.load;
      notifyOfferAccepted({
        recipientUserId: offer.carrier_id,
        fromName: 'The shipper',
        route: load ? `${load.origin_city}, ${load.origin_country} → ${load.destination_city}, ${load.destination_country}` : undefined,
        price: offer.price,
        actionUrl: `${window.location.origin}/dashboard/carrier`,
        idempotencyKey: `offer-accept-${offerId}`,
      });
    }
    toast.success('Offer accepted');
    setSelected(null);
    fetchData();
  };

  const declineOfferReceived = async (offerId: string) => {
    const { error } = await supabase.from('offers').delete().eq('id', offerId);
    if (error) return toast.error('Failed to decline offer');
    toast.success('Offer declined');
    setSelected(null);
    fetchData();
  };

  const acceptCounter = async (reqId: string) => {
    const req = made.find((r) => r.id === reqId);
    const { error } = await supabase.from('route_requests').update({ status: 'accepted' }).eq('id', reqId);
    if (error) return toast.error('Failed to accept counter');
    if (req?.carrier_id) {
      notifyOfferAccepted({
        recipientUserId: req.carrier_id,
        fromName: 'The shipper',
        route: req.route ? `${req.route.origin_city}, ${req.route.origin_country} → ${req.route.destination_city}, ${req.route.destination_country}` : undefined,
        price: req.offer_price,
        pallets: req.pallets_requested,
        actionUrl: `${window.location.origin}/dashboard/carrier/requests/${reqId}`,
        idempotencyKey: `counter-accept-${reqId}`,
      });
    }
    toast.success('Counter accepted');
    setSelected(null);
    fetchData();
  };

  const declineRequest = async (reqId: string) => {
    const { error } = await supabase.from('route_requests').update({ status: 'cancelled' }).eq('id', reqId);
    if (error) return toast.error('Failed to decline');
    toast.success('Offer declined');
    setSelected(null);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/shipper')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
              <Handshake className="h-5 w-5" /> My Offers
            </h1>
            <p className="text-sm text-muted-foreground">Bids you've sent and offers carriers sent you</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid grid-cols-2 max-w-md">
              <TabsTrigger value="made" className="gap-2">
                <Send className="h-4 w-4" /> Offers I've Made
                {unreadMade > 0 && (
                  <Badge className="ml-1 h-5 px-1.5 bg-primary text-primary-foreground">{unreadMade}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="received" className="gap-2">
                <Inbox className="h-4 w-4" /> Offers Received
                {unreadReceived > 0 && (
                  <Badge className="ml-1 h-5 px-1.5 bg-primary text-primary-foreground">{unreadReceived}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="made" className="mt-6">
              {made.length === 0 ? (
                <EmptyState
                  icon={<Send className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />}
                  title="No offers sent yet"
                  description="Browse carrier routes and send your first bid."
                  cta={<Button asChild><Link to="/routes">Browse Routes</Link></Button>}
                />
              ) : (
                <div className="space-y-3">
                  {made.map((r) => {
                    const s = mapRequestStatus(r.status);
                    return (
                      <Card
                        key={r.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelected({ kind: 'made', data: r })}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={statusPill[s]}>{statusLabel[s]}</Badge>
                                {r.offer_type === 'alternative' ? (
                                  <Badge variant="outline" className="text-xs border-success/40 text-success">
                                    <Shuffle className="h-3 w-3 mr-1" /> Alternative Stop
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                    Direct Bid
                                  </Badge>
                                )}
                              </div>
                              {r.route && (
                                <div className="flex items-center gap-2 text-sm text-foreground mb-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {r.route.origin_city} → {r.route.destination_city}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {r.pallets} pallets</span>
                                {r.offer_price != null && (
                                  <span className="flex items-center gap-1 text-foreground font-medium">
                                    <Euro className="h-3 w-3" /> €{Number(r.offer_price).toLocaleString()}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {format(new Date(r.created_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                              {r.carrier?.id && (
                                <div className="mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                                  <CounterpartyCard userId={r.carrier.id} role="carrier" variant="inline" />
                                </div>
                              )}
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="received" className="mt-6">
              {received.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />}
                  title="No offers received yet"
                  description="Carriers will appear here when they bid on your loads."
                  cta={<Button asChild><Link to="/dashboard/shipper/loads">View My Loads</Link></Button>}
                />
              ) : (
                <div className="space-y-3">
                  {received.map((o) => {
                    const s = mapOfferStatus(o.is_accepted);
                    return (
                      <Card
                        key={o.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelected({ kind: 'received', data: o })}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={statusPill[s]}>{statusLabel[s]}</Badge>
                              </div>
                              {o.carrier?.id && (
                                <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                                  <CounterpartyCard userId={o.carrier.id} role="carrier" variant="inline" />
                                </div>
                              )}
                              {o.load && (
                                <div className="flex items-center gap-2 text-sm text-foreground mb-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {o.load.origin_city} → {o.load.destination_city}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                {o.load && (
                                  <span className="flex items-center gap-1">
                                    <Package className="h-3 w-3" /> Load · {format(new Date(o.load.pickup_date_from), 'MMM d')}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-foreground font-medium">
                                  <Euro className="h-3 w-3" /> €{Number(o.price).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {format(new Date(o.created_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
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

      {/* Slide-over detail */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected?.kind === 'made' && (
            <MadeDetail
              req={selected.data}
              onAcceptCounter={acceptCounter}
              onDecline={declineRequest}
              onProceed={(id) => navigate(`/dashboard/shipper/requests/${id}`)}
            />
          )}
          {selected?.kind === 'received' && (
            <ReceivedDetail
              offer={selected.data}
              onAccept={acceptOfferReceived}
              onDecline={declineOfferReceived}
              onCounter={(o) => {
                toast.info('Open Messages to send a counter-offer to the carrier.');
                navigate('/dashboard/shipper/messages');
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EmptyState({ icon, title, description, cta }: any) {
  return (
    <Card className="max-w-lg mx-auto">
      <CardContent className="text-center py-12">
        {icon}
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{description}</p>
        {cta}
      </CardContent>
    </Card>
  );
}

function MadeDetail({ req, onAcceptCounter, onDecline, onProceed }: any) {
  const s = mapRequestStatus(req.status);
  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          {req.offer_type === 'alternative' ? 'Alternative Stop Proposal' : 'Direct Bid'}
          <Badge className={statusPill[s]}>{statusLabel[s]}</Badge>
        </SheetTitle>
        <SheetDescription>
          Submitted {format(new Date(req.created_at), 'PPP')}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-4 text-sm">
        {req.route && (
          <Row label="Route">
            {req.route.origin_city}, {req.route.origin_country} → {req.route.destination_city}, {req.route.destination_country}
          </Row>
        )}
        {req.carrier?.id && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Carrier</div>
            <CounterpartyCard userId={req.carrier.id} role="carrier" variant="inline" />
          </div>
        )}
        <Row label="Pallets">{req.pallets}</Row>
        <Row label="Goods">{req.goods_type} · {req.weight_kg} kg</Row>
        {req.offer_price != null && <Row label="Your offered price">€{Number(req.offer_price).toLocaleString()}</Row>}
        <Row label="Pickup date">{format(new Date(req.shipment_date), 'PPP')}</Row>
        <Row label="Pickup address">{req.pickup_address}</Row>
        <Row label="Delivery address">{req.delivery_address}</Row>
        {req.offer_type === 'alternative' && req.proposed_pickup_city && (
          <Row label="Proposed stops">
            {req.proposed_pickup_city}, {req.proposed_pickup_country} → {req.proposed_dropoff_city}, {req.proposed_dropoff_country}
          </Row>
        )}
        {req.shipper_message && <Row label="Your message">{req.shipper_message}</Row>}
        {req.message && <Row label="Carrier response">{req.message}</Row>}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {s === 'countered' && (
          <>
            <Button onClick={() => onAcceptCounter(req.id)}>Accept Counter</Button>
            <Button variant="outline" onClick={() => onDecline(req.id)}>Decline</Button>
          </>
        )}
        {s === 'accepted' && (
          <Button onClick={() => onProceed(req.id)}>Proceed to Booking</Button>
        )}
        {s === 'pending' && (
          <Button variant="outline" onClick={() => onDecline(req.id)}>Cancel Offer</Button>
        )}
      </div>
    </>
  );
}

function ReceivedDetail({ offer, onAccept, onCounter, onDecline }: any) {
  const s = mapOfferStatus(offer.is_accepted);
  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          Offer received
          <Badge className={statusPill[s]}>{statusLabel[s]}</Badge>
        </SheetTitle>
        <SheetDescription>
          Received {format(new Date(offer.created_at), 'PPP')}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-4 text-sm">
        {offer.carrier?.id && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1.5">From</div>
            <CounterpartyCard userId={offer.carrier.id} role="carrier" variant="card" />
          </div>
        )}
        {offer.load && (
          <Row label="Load">
            {offer.load.origin_city} → {offer.load.destination_city} · pickup {format(new Date(offer.load.pickup_date_from), 'PPP')}
          </Row>
        )}
        <Row label="Proposed price">€{Number(offer.price).toLocaleString()}</Row>
        {offer.message && <Row label="Carrier message">{offer.message}</Row>}
      </div>


      <div className="mt-8 flex flex-wrap gap-2">
        {s === 'pending' && (
          <>
            <Button onClick={() => onAccept(offer.id)}>Accept</Button>
            <Button variant="outline" onClick={() => onCounter(offer)}>Counter</Button>
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDecline(offer.id)}>
              Decline
            </Button>
          </>
        )}
        {s === 'accepted' && (
          <Button asChild>
            <Link to={`/load/${offer.load_id}`}>Open Load</Link>
          </Button>
        )}
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-border/40 last:border-0">
      <div className="text-muted-foreground text-xs uppercase tracking-wide">{label}</div>
      <div className="col-span-2 text-foreground">{children}</div>
    </div>
  );
}
