import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SchengenCountrySelect } from '@/components/SchengenCountrySelect';
import {
  ArrowLeft, ArrowRight, MapPin, Package, Calendar, Send, Loader2,
  CheckCircle, Shuffle, Lock, Euro
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { z } from 'zod';
import { notifyOfferReceived } from '@/lib/notify';
import { epeToLdm, formatCapacity } from '@/lib/capacityUtils';

// Returns { ok, capLabel } — capLabel is the human-readable available capacity
function checkPalletsAgainstRoute(pallets: number, route: any): { ok: boolean } {
  if (route?.space_ldm && route.space_ldm > 0) {
    return { ok: epeToLdm(pallets) <= route.space_ldm };
  }
  return { ok: pallets <= (route?.available_pallets ?? 0) };
}

function routeCapacityLabel(route: any): string {
  if (route?.space_type && route?.space_value != null) {
    return `${formatCapacity(route.space_type, route.space_value)} available`;
  }
  return `${route?.available_pallets ?? 0} pallets available`;
}

const directSchema = z.object({
  price: z.coerce.number().positive('Bid price must be greater than 0'),
  pallets: z.coerce.number().int().positive('Pallets must be at least 1'),
  message: z.string().trim().max(1000, 'Message too long').optional(),
});

const altSchema = directSchema.extend({
  pickupCity: z.string().trim().min(2, 'Pickup city required').max(100),
  pickupCountry: z.string().trim().min(2, 'Pickup country required'),
  dropoffCity: z.string().trim().min(2, 'Dropoff city required').max(100),
  dropoffCountry: z.string().trim().min(2, 'Dropoff country required'),
  reason: z.string().trim().min(10, 'Please explain why this stop works (min 10 chars)').max(1000),
});

export default function RouteOfferPage() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [route, setRoute] = useState<any>(null);
  const [carrierProfile, setCarrierProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<null | { type: 'direct' | 'alternative'; id: string }>(null);

  const [direct, setDirect] = useState({ price: '', pallets: '1', message: '' });
  const [alt, setAlt] = useState({
    pickupCity: '', pickupCountry: '',
    dropoffCity: '', dropoffCountry: '',
    price: '', pallets: '1', reason: '',
  });

  useEffect(() => {
    if (routeId) fetchRoute();
  }, [routeId]);

  const fetchRoute = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*, route_stops(*)')
        .eq('id', routeId)
        .single();
      if (error) throw error;
      setRoute(data);
      setAlt((a) => ({
        ...a,
        dropoffCity: data?.destination_city || '',
        dropoffCountry: data?.destination_country || '',
      }));


      if (data?.carrier_id) {
        const { data: profile } = await supabase
          .from('public_profiles')
          .select('full_name, company_name, verification_status')
          .eq('id', data.carrier_id)
          .single();
        setCarrierProfile(profile);
      }
    } catch {
      toast.error('Failed to load route');
    } finally {
      setLoading(false);
    }
  };

  const submitDirect = async () => {
    if (!user || !route) return;
    const parsed = directSchema.safeParse(direct);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!checkPalletsAgainstRoute(parsed.data.pallets, route).ok) {
      toast.error(`Only ${routeCapacityLabel(route)} on this route`);
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('route_requests').insert({
        route_id: route.id,
        shipper_id: user.id,
        carrier_id: route.carrier_id,
        offer_type: 'direct',
        offer_price: parsed.data.price,
        pallets_requested: parsed.data.pallets,
        pallets: parsed.data.pallets,
        shipper_message: parsed.data.message || null,
        message: parsed.data.message || null,
        pickup_address: `${route.origin_city}, ${route.origin_country}`,
        delivery_address: `${route.destination_city}, ${route.destination_country}`,
        goods_type: 'General Cargo',
        status: 'sent',
        shipment_date: route.departure_date_from,
        weight_kg: 0,
      } as any).select('id').single();
      if (error) throw error;
      notifyOfferReceived({
        recipientUserId: route.carrier_id,
        fromName: 'A shipper',
        route: `${route.origin_city}, ${route.origin_country} → ${route.destination_city}, ${route.destination_country}`,
        price: parsed.data.price,
        pallets: parsed.data.pallets,
        kind: 'bid',
        actionUrl: `${window.location.origin}/dashboard/carrier/requests/${data.id}`,
        idempotencyKey: `bid-direct-${data.id}`,
      });
      setConfirmation({ type: 'direct', id: data.id });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  const submitAlternative = async () => {
    if (!user || !route) return;
    const parsed = altSchema.safeParse(alt);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!checkPalletsAgainstRoute(parsed.data.pallets, route).ok) {
      toast.error(`Only ${routeCapacityLabel(route)} on this route`);
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('route_requests').insert({
        route_id: route.id,
        shipper_id: user.id,
        carrier_id: route.carrier_id,
        offer_type: 'alternative',
        offer_price: parsed.data.price,
        pallets_requested: parsed.data.pallets,
        pallets: parsed.data.pallets,
        proposed_pickup_city: parsed.data.pickupCity,
        proposed_pickup_country: parsed.data.pickupCountry,
        proposed_dropoff_city: parsed.data.dropoffCity,
        proposed_dropoff_country: parsed.data.dropoffCountry,
        shipper_message: parsed.data.reason,
        message: parsed.data.reason,
        pickup_address: `${parsed.data.pickupCity}, ${parsed.data.pickupCountry}`,
        delivery_address: `${parsed.data.dropoffCity}, ${parsed.data.dropoffCountry}`,
        goods_type: 'General Cargo',
        status: 'sent',
        shipment_date: route.departure_date_from,
        weight_kg: 0,
      } as any).select('id').single();
      if (error) throw error;
      notifyOfferReceived({
        recipientUserId: route.carrier_id,
        fromName: 'A shipper',
        route: `${parsed.data.pickupCity} → ${parsed.data.dropoffCity}`,
        price: parsed.data.price,
        pallets: parsed.data.pallets,
        kind: 'request',
        actionUrl: `${window.location.origin}/dashboard/carrier/requests/${data.id}`,
        idempotencyKey: `bid-alt-${data.id}`,
      });
      setConfirmation({ type: 'alternative', id: data.id });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit alternative offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Route not found.</p>
            <Button asChild><Link to="/routes">Browse routes</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const flexible = !!route.open_to_extra_stops;

  if (confirmation) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/shipper')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-heading font-bold">Offer submitted</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-10 max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-heading font-bold">
                {confirmation.type === 'direct' ? 'Bid placed' : 'Alternative stop proposed'}
              </h2>
              <p className="text-muted-foreground">
                {route.origin_city}, {route.origin_country} → {route.destination_city}, {route.destination_country}
              </p>
              <Badge className="bg-primary/10 text-primary">Pending carrier review</Badge>
              <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild><Link to={`/dashboard/shipper/requests/${confirmation.id}`}>View offer</Link></Button>
                <Button variant="outline" asChild><Link to="/dashboard/shipper">Back to dashboard</Link></Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-bold">Make an offer</h1>
            <p className="text-sm text-muted-foreground">
              {route?.carrier_id ? (
                <Link to={`/profile/carrier/${route.carrier_id}`} className="hover:underline">
                  {carrierProfile?.company_name || carrierProfile?.full_name || 'Carrier route'}
                </Link>
              ) : (carrierProfile?.company_name || carrierProfile?.full_name || 'Carrier route')}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Route header */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium">
              <MapPin className="h-5 w-5 text-carrier" />
              <span>{route.origin_city}, {route.origin_country}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span>{route.destination_city}, {route.destination_country}</span>
              {flexible && (
                <Badge className="ml-2 bg-success/10 text-success border-success/30 border">
                  <Shuffle className="h-3 w-3 mr-1" /> Flexible
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Package className="h-4 w-4" /> {route.available_pallets} pallets available</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(route.departure_date_from), 'MMM d')}
                {route.departure_date_to && route.departure_date_to !== route.departure_date_from && (
                  <> – {format(new Date(route.departure_date_to), 'MMM d')}</>
                )}
              </span>
              {route.price && (
                <span className="flex items-center gap-1 text-foreground font-medium">
                  <Euro className="h-4 w-4 text-primary" /> Price anchor: €{Number((route as any).price).toLocaleString()}
                </span>
              )}

            </div>
            {flexible && route.flexibility_note && (
              <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                <span className="font-medium text-foreground">Carrier flexibility:</span> {route.flexibility_note}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Bid</TabsTrigger>
            {flexible ? (
              <TabsTrigger value="alternative">
                <Shuffle className="h-3.5 w-3.5 mr-1" /> Alternative Stop
              </TabsTrigger>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center justify-center text-sm font-medium text-muted-foreground/60 cursor-not-allowed gap-1.5">
                      <Lock className="h-3.5 w-3.5" /> Alternative Stop
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>This carrier hasn't enabled route flexibility.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </TabsList>

          {/* Direct Bid */}
          <TabsContent value="direct">
            <Card>
              <CardHeader>
                <CardTitle>Bid on this exact route</CardTitle>
                <CardDescription>
                  Bid for the posted route {route.origin_city} → {route.destination_city}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="d-price">Your bid (EUR)</Label>
                    <Input
                      id="d-price" type="number" min="1" step="1"
                      value={direct.price}
                      onChange={(e) => setDirect({ ...direct, price: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="d-pallets">Pallets</Label>
                    <Input
                      id="d-pallets" type="number" min="1" max={route.available_pallets}
                      value={direct.pallets}
                      onChange={(e) => setDirect({ ...direct, pallets: e.target.value })}
                      disabled={submitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Max {route.available_pallets} available</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="d-message">Message to carrier (optional)</Label>
                  <Textarea
                    id="d-message" maxLength={1000} placeholder="Any context you'd like to share…"
                    value={direct.message}
                    onChange={(e) => setDirect({ ...direct, message: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <Button onClick={submitDirect} disabled={submitting} className="w-full">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Place Bid
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alternative */}
          {flexible && (
            <TabsContent value="alternative">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shuffle className="h-5 w-5 text-success" /> Propose an alternative stop
                  </CardTitle>
                  <CardDescription>
                    Suggest a pickup or dropoff that lies along this carrier's corridor.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-md bg-muted/50 text-sm">
                    <div className="text-xs text-muted-foreground mb-1">Carrier's route</div>
                    <div className="font-medium">
                      {route.origin_city}, {route.origin_country} → {route.destination_city}, {route.destination_country}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="a-pcity">Your pickup city</Label>
                      <Input
                        id="a-pcity" maxLength={100}
                        value={alt.pickupCity}
                        onChange={(e) => setAlt({ ...alt, pickupCity: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label>Pickup country</Label>
                      <SchengenCountrySelect
                        value={alt.pickupCountry}
                        onValueChange={(v) => setAlt({ ...alt, pickupCountry: v })}
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="a-dcity">Your dropoff city</Label>
                      <Input
                        id="a-dcity" maxLength={100}
                        value={alt.dropoffCity}
                        onChange={(e) => setAlt({ ...alt, dropoffCity: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label>Dropoff country</Label>
                      <SchengenCountrySelect
                        value={alt.dropoffCountry}
                        onValueChange={(v) => setAlt({ ...alt, dropoffCountry: v })}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Must be on or near the carrier's route.</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="a-price">Your bid (EUR)</Label>
                      <Input
                        id="a-price" type="number" min="1" step="1"
                        value={alt.price}
                        onChange={(e) => setAlt({ ...alt, price: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="a-pallets">Pallets</Label>
                      <Input
                        id="a-pallets" type="number" min="1" max={route.available_pallets}
                        value={alt.pallets}
                        onChange={(e) => setAlt({ ...alt, pallets: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="a-reason">Explain why this stop works for the carrier</Label>
                    <Textarea
                      id="a-reason" maxLength={1000}
                      placeholder="e.g. Pickup is 12 km off the A4, easy access, dropoff is on the way to your final destination…"
                      value={alt.reason}
                      onChange={(e) => setAlt({ ...alt, reason: e.target.value })}
                      disabled={submitting}
                    />
                  </div>

                  <Button onClick={submitAlternative} disabled={submitting} className="w-full">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shuffle className="h-4 w-4 mr-2" />}
                    Propose Alternative Stop
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
