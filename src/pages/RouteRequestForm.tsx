import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, MapPin, Package, Truck, Calendar, Send, Loader2,
  CheckCircle, AlertTriangle, XCircle, Info, Scale
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { notifyOfferReceived } from '@/lib/notify';

const cargoTypes = [
  'General Cargo', 'Palletized Goods', 'Fragile', 'Refrigerated',
  'Hazardous', 'Oversized', 'Livestock', 'Vehicles', 'Dry Bulk', 'Other'
];

export default function RouteRequestForm() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [route, setRoute] = useState<any>(null);
  const [carrierProfile, setCarrierProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    goodsType: '',
    weightKg: '',
    volumeCbm: '',
    pallets: '',
    shipmentDate: '',
    specialRequirements: '',
    message: '',
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

      if (data?.carrier_id) {
        const { data: profile } = await supabase
          .from('public_profiles')
          .select('full_name, company_name')
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

  const getFitIndicator = () => {
    if (!route || !form.pallets) return null;
    const pallets = parseInt(form.pallets) || 0;
    if (pallets > route.available_pallets) {
      return { level: 'outside', label: 'Outside route tolerance', icon: XCircle, color: 'text-destructive' };
    }
    if (pallets > route.available_pallets * 0.8) {
      return { level: 'review', label: 'Needs carrier review', icon: AlertTriangle, color: 'text-warning' };
    }
    return { level: 'good', label: 'Good fit', icon: CheckCircle, color: 'text-success' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !route) return;

    if (!form.pickupAddress || !form.deliveryAddress || !form.goodsType || !form.pallets || !form.shipmentDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Create request
      const { data: request, error: reqError } = await supabase
        .from('route_requests')
        .insert({
          route_id: route.id,
          shipper_id: user.id,
          carrier_id: route.carrier_id,
          pickup_address: form.pickupAddress,
          delivery_address: form.deliveryAddress,
          goods_type: form.goodsType,
          weight_kg: parseFloat(form.weightKg) || 0,
          volume_cbm: form.volumeCbm ? parseFloat(form.volumeCbm) : null,
          pallets: parseInt(form.pallets) || 1,
          shipment_date: form.shipmentDate,
          special_requirements: form.specialRequirements || null,
          message: form.message || null,
          status: 'sent',
        })
        .select()
        .single();

      if (reqError) throw reqError;

      notifyOfferReceived({
        recipientUserId: route.carrier_id,
        fromName: 'A shipper',
        route: `${form.pickupAddress} → ${form.deliveryAddress}`,
        pallets: parseInt(form.pallets) || 1,
        kind: 'request',
        actionUrl: `${window.location.origin}/dashboard/carrier/requests/${request.id}`,
        idempotencyKey: `request-new-${request.id}`,
      });


      // Create system message
      await supabase.from('route_request_messages').insert({
        request_id: request.id,
        sender_id: user.id,
        content: 'Request sent',
        is_system: true,
      });

      // Create initial message if provided
      if (form.message.trim()) {
        await supabase.from('route_request_messages').insert({
          request_id: request.id,
          sender_id: user.id,
          content: form.message.trim(),
          is_system: false,
        });
      }

      toast.success('Request sent to carrier!');
      navigate(`/dashboard/shipper/requests/${request.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const fit = getFitIndicator();

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
          <Button asChild><Link to="/routes">Browse Routes</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Request Load on Route</h1>
              <p className="text-sm text-muted-foreground">
                {route.origin_city} → {route.destination_city}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4 text-primary" />
                Route Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Carrier:</span>{' '}
                  <span className="font-medium text-foreground">
                    {carrierProfile?.company_name || carrierProfile?.full_name || 'Carrier'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Route:</span>{' '}
                  <span className="font-medium text-foreground">
                    {route.origin_city} → {route.destination_city}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Departure:</span>{' '}
                  <span className="font-medium text-foreground">
                    {format(new Date(route.departure_date_from), 'MMM d, yyyy')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Available:</span>{' '}
                  <span className="font-medium text-foreground">{route.available_pallets} pallets</span>
                </div>
                {route.max_deviation_km && (
                  <div>
                    <span className="text-muted-foreground">Max deviation:</span>{' '}
                    <span className="font-medium text-foreground">{route.max_deviation_km} km</span>
                  </div>
                )}
                {route.max_destination_radius_km && (
                  <div>
                    <span className="text-muted-foreground">Destination radius:</span>{' '}
                    <span className="font-medium text-foreground">{route.max_destination_radius_km} km</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section A — Shipment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Shipment Details
              </CardTitle>
              <CardDescription>Describe what you need to ship</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Pickup Address <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g., Warehouse 5, Rotterdam Port"
                    className="mt-1"
                    value={form.pickupAddress}
                    onChange={e => setForm({ ...form, pickupAddress: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label>Delivery Address <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g., Distribution Center, Munich"
                    className="mt-1"
                    value={form.deliveryAddress}
                    onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label>Type of Goods <span className="text-destructive">*</span></Label>
                <Select value={form.goodsType} onValueChange={v => setForm({ ...form, goodsType: v })} disabled={submitting}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select goods type" /></SelectTrigger>
                  <SelectContent>
                    {cargoTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Weight (kg) <span className="text-destructive">*</span></Label>
                  <Input
                    type="number" min="0" placeholder="e.g., 2000"
                    className="mt-1"
                    value={form.weightKg}
                    onChange={e => setForm({ ...form, weightKg: e.target.value })}
                    required disabled={submitting}
                  />
                </div>
                <div>
                  <Label>Volume (m³)</Label>
                  <Input
                    type="number" min="0" step="0.1" placeholder="e.g., 5.5"
                    className="mt-1"
                    value={form.volumeCbm}
                    onChange={e => setForm({ ...form, volumeCbm: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label>Pallets <span className="text-destructive">*</span></Label>
                  <Input
                    type="number" min="1" placeholder="e.g., 4"
                    className="mt-1"
                    value={form.pallets}
                    onChange={e => setForm({ ...form, pallets: e.target.value })}
                    required disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Preferred Shipment Date <span className="text-destructive">*</span></Label>
                  <Input
                    type="date" className="mt-1"
                    value={form.shipmentDate}
                    onChange={e => setForm({ ...form, shipmentDate: e.target.value })}
                    required disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label>Special Requirements</Label>
                <Textarea
                  placeholder="Any special handling needs, temperature requirements, etc."
                  className="mt-1"
                  value={form.specialRequirements}
                  onChange={e => setForm({ ...form, specialRequirements: e.target.value })}
                  disabled={submitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section B — Fit to Route */}
          {fit && (
            <Card className={
              fit.level === 'good' ? 'border-success/30 bg-success/5' :
              fit.level === 'review' ? 'border-warning/30 bg-warning/5' :
              'border-destructive/30 bg-destructive/5'
            }>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <fit.icon className={`h-5 w-5 ${fit.color}`} />
                  <div>
                    <div className={`font-medium ${fit.color}`}>{fit.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {fit.level === 'good' && 'Your shipment fits within the available route capacity.'}
                      {fit.level === 'review' && 'Close to capacity limit. The carrier will review your request.'}
                      {fit.level === 'outside' && 'Exceeds available capacity. You can still submit, but the carrier may not accept.'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section C — Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-4 w-4 text-primary" />
                Message to Carrier
              </CardTitle>
              <CardDescription>Introduce your shipment and explain any important delivery requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Hi, I'd like to request space on this route for 2 pallets of packaged goods from Innsbruck to Munich. Flexible on delivery time."
                className="min-h-[120px]"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                disabled={submitting}
              />
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4" /> Send Request</>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
