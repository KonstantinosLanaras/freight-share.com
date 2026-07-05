import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, MapPin, Package, Truck, Send, Loader2,
  MessageSquare, CheckCircle, XCircle, Eye, AlertTriangle,
  Scale, Upload, Link as LinkIcon, Image, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { InsuranceSummaryCard } from '@/components/insurance/InsuranceSummaryCard';
import { notifyOfferAccepted } from '@/lib/notify';

const statusConfig: Record<string, { label: string; color: string }> = {
  sent: { label: 'New', color: 'bg-primary/10 text-primary' },
  viewed: { label: 'Viewed', color: 'bg-accent/10 text-accent' },
  in_discussion: { label: 'In Discussion', color: 'bg-accent/10 text-accent' },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive' },
  expired: { label: 'Expired', color: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
};

export default function CarrierRequestDetails() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [shipperProfile, setShipperProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [carrierInsurance, setCarrierInsurance] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Accept form state
  const [remainingPallets, setRemainingPallets] = useState(0);
  const [remainingPayloadKg, setRemainingPayloadKg] = useState(0);
  const [maxDeviationKm, setMaxDeviationKm] = useState(0);
  const [maxDestRadiusKm, setMaxDestRadiusKm] = useState(0);
  const [tripDescription, setTripDescription] = useState('');
  const [routeLink, setRouteLink] = useState('');
  const [itineraryFile, setItineraryFile] = useState<File | null>(null);

  useEffect(() => {
    if (requestId) fetchData();
  }, [requestId]);

  useEffect(() => {
    if (!requestId) return;
    const channel = supabase
      .channel(`carrier-req-msgs-${requestId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'route_request_messages',
        filter: `request_id=eq.${requestId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async () => {
    try {
      const { data: req, error } = await supabase
        .from('route_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      if (error) throw error;
      setRequest(req);

      // Mark as viewed
      if (req.status === 'sent') {
        await supabase.from('route_requests').update({ status: 'viewed' }).eq('id', requestId);
        await supabase.from('route_request_messages').insert({
          request_id: requestId,
          sender_id: user!.id,
          content: 'Carrier viewed request',
          is_system: true,
        });
        setRequest({ ...req, status: 'viewed' });
      }

      const [routeRes, profileRes, msgsRes, insuranceRes] = await Promise.all([
        supabase.from('routes').select('*').eq('id', req.route_id).single(),
        supabase.from('public_profiles').select('full_name, company_name').eq('id', req.shipper_id).single(),
        supabase.from('route_request_messages').select('*').eq('request_id', requestId).order('created_at', { ascending: true }),
        supabase.from('carrier_insurance').select('*').eq('carrier_id', user!.id).maybeSingle(),
      ]);

      const r = routeRes.data;
      setRoute(r);
      setShipperProfile(profileRes.data);
      setMessages(msgsRes.data || []);
      setCarrierInsurance(insuranceRes.data || null);
      // Pre-fill accept form
      if (r) {
        setRemainingPallets(Math.max(0, r.available_pallets - req.pallets));
        setRemainingPayloadKg(r.max_payload_kg || 0);
        setMaxDeviationKm(r.max_deviation_km || 50);
        setMaxDestRadiusKm(r.max_destination_radius_km || 50);
        setTripDescription(r.trip_description || '');
        setRouteLink(r.route_link || '');
      }
    } catch {
      toast.error('Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !requestId) return;
    setSending(true);
    try {
      await supabase.from('route_request_messages').insert({
        request_id: requestId,
        sender_id: user.id,
        content: newMessage.trim(),
        is_system: false,
      });
      // Update status to in_discussion if still just viewed
      if (request.status === 'viewed') {
        await supabase.from('route_requests').update({ status: 'in_discussion' }).eq('id', requestId);
        setRequest({ ...request, status: 'in_discussion' });
      }
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleReject = async () => {
    if (!requestId || !user) return;
    try {
      await supabase.from('route_requests').update({ status: 'rejected' }).eq('id', requestId);
      await supabase.from('route_request_messages').insert({
        request_id: requestId,
        sender_id: user.id,
        content: 'Carrier rejected request',
        is_system: true,
      });
      setRequest({ ...request, status: 'rejected' });
      toast.success('Request rejected');
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleAccept = async () => {
    if (!requestId || !user || !route) return;
    setAcceptLoading(true);
    try {
      // Upload itinerary image if provided
      let itineraryImageUrl = route.itinerary_image_url;
      if (itineraryFile) {
        const ext = itineraryFile.name.split('.').pop();
        const path = `${user.id}/${route.id}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('itinerary-images')
          .upload(path, itineraryFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('itinerary-images').getPublicUrl(path);
        itineraryImageUrl = urlData.publicUrl;
      }

      // Update route
      await supabase.from('routes').update({
        available_pallets: remainingPallets,
        max_payload_kg: remainingPayloadKg,
        max_deviation_km: maxDeviationKm || null,
        max_destination_radius_km: maxDestRadiusKm || null,
        trip_description: tripDescription || null,
        route_link: routeLink || null,
        itinerary_image_url: itineraryImageUrl,
      }).eq('id', route.id);

      // Accept request
      await supabase.from('route_requests').update({ status: 'accepted' }).eq('id', requestId);
      await supabase.from('route_request_messages').insert({
        request_id: requestId,
        sender_id: user.id,
        content: 'Carrier accepted request',
        is_system: true,
      });

      setRequest({ ...request, status: 'accepted' });
      setShowAcceptForm(false);
      toast.success('Request accepted! Route updated.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept');
    } finally {
      setAcceptLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!request) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Request not found</p></div>;
  }

  const status = statusConfig[request.status] || statusConfig.sent;
  const canRespond = ['viewed', 'in_discussion', 'sent'].includes(request.status);

  if (showAcceptForm) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setShowAcceptForm(false)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-heading font-bold text-foreground">Accept & Update Route</h1>
                <p className="text-sm text-muted-foreground">Confirm acceptance and update route details</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
          {/* A — Capacity Update */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Capacity Update
              </CardTitle>
              <CardDescription>Update remaining capacity after accepting this load</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Remaining Pallet Spaces</Label>
                  <Input
                    type="number" min="0"
                    value={remainingPallets}
                    onChange={e => setRemainingPallets(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Was {route?.available_pallets}, accepting {request.pallets} pallets
                  </p>
                </div>
                <div>
                  <Label>Remaining Payload (kg)</Label>
                  <Input
                    type="number" min="0"
                    value={remainingPayloadKg}
                    onChange={e => setRemainingPayloadKg(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* B — Route Tolerance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Route Tolerance Controls
              </CardTitle>
              <CardDescription>Adjust how far you're willing to deviate for pickups/deliveries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Maximum deviation from route</Label>
                  <span className="text-sm font-medium text-foreground">{maxDeviationKm} km</span>
                </div>
                <Slider
                  value={[maxDeviationKm]}
                  onValueChange={([v]) => setMaxDeviationKm(v)}
                  max={200}
                  step={5}
                />
                <p className="text-xs text-muted-foreground mt-1">How far off your planned route you're willing to go for pickup or delivery</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Maximum distance from destination city</Label>
                  <span className="text-sm font-medium text-foreground">{maxDestRadiusKm} km</span>
                </div>
                <Slider
                  value={[maxDestRadiusKm]}
                  onValueChange={([v]) => setMaxDestRadiusKm(v)}
                  max={200}
                  step={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  e.g., if destination is {route?.destination_city}, a value of {maxDestRadiusKm} km means you can deliver within {maxDestRadiusKm} km radius
                </p>
              </div>
            </CardContent>
          </Card>

          {/* C — Trip Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4 text-primary" />
                Trip Description
              </CardTitle>
              <CardDescription>Describe the trip so the shipper understands your route and flexibility</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Main roads, planned stops, flexibility, timing preferences, delivery limitations..."
                className="min-h-[120px]"
                value={tripDescription}
                onChange={e => setTripDescription(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* D — Itinerary Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Image className="h-4 w-4 text-primary" />
                Planned Itinerary Image
              </CardTitle>
              <CardDescription>Upload a screenshot of your planned route from Google Maps or another route planner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {route?.itinerary_image_url && !itineraryFile && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img src={route.itinerary_image_url} alt="Current itinerary" className="w-full max-h-64 object-cover" />
                </div>
              )}
              <div>
                <Label htmlFor="itinerary-upload" className="cursor-pointer">
                  <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{itineraryFile ? itineraryFile.name : 'Upload itinerary image'}</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </Label>
                <input
                  id="itinerary-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => setItineraryFile(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label>Route Link (optional)</Label>
                <div className="flex gap-2 mt-1">
                  <LinkIcon className="h-4 w-4 text-muted-foreground mt-3" />
                  <Input
                    placeholder="Paste a route-sharing link"
                    value={routeLink}
                    onChange={e => setRouteLink(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowAcceptForm(false)}>
              Back
            </Button>
            <Button className="flex-1" onClick={handleAccept} disabled={acceptLoading}>
              {acceptLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</>
              ) : (
                <><CheckCircle className="h-4 w-4" /> Confirm Acceptance</>
              )}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/carrier/requests')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-heading font-bold text-foreground">Request Details</h1>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  From {shipperProfile?.company_name || shipperProfile?.full_name || 'Shipper'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Route Summary */}
            {route && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Route Summary</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span className="font-medium">{route.origin_city} → {route.destination_city}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Available</span><span className="font-medium">{route.available_pallets} pallets</span></div>
                  {route.max_deviation_km && <div className="flex justify-between"><span className="text-muted-foreground">Max deviation</span><span className="font-medium">{route.max_deviation_km} km</span></div>}
                  {route.max_destination_radius_km && <div className="flex justify-between"><span className="text-muted-foreground">Dest. radius</span><span className="font-medium">{route.max_destination_radius_km} km</span></div>}
                </CardContent>
              </Card>
            )}

            {/* Shipper Request */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Shipper Request</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Pickup</span><span className="font-medium text-right max-w-[160px] truncate">{request.pickup_address}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-medium text-right max-w-[160px] truncate">{request.delivery_address}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Goods</span><span className="font-medium">{request.goods_type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pallets</span><span className="font-medium">{request.pallets}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span className="font-medium">{request.weight_kg} kg</span></div>
                {request.volume_cbm && <div className="flex justify-between"><span className="text-muted-foreground">Volume</span><span className="font-medium">{request.volume_cbm} m³</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{format(new Date(request.shipment_date), 'MMM d, yyyy')}</span></div>
                {request.special_requirements && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground block mb-1">Special requirements</span>
                    <p className="text-foreground">{request.special_requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            {canRespond && (
              <Card>
                <CardHeader><CardTitle className="text-base">Decision</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {!carrierInsurance ? (
                    <>
                      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-2">
                        <p className="text-sm text-warning font-medium flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          Insurance required to accept
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You must provide insurance details before accepting load requests.
                        </p>
                      </div>
                      <Button className="w-full" onClick={() => navigate(`/dashboard/carrier/insurance?returnTo=${encodeURIComponent(`/dashboard/carrier/requests/${requestId}`)}`)}>
                        <ShieldCheck className="h-4 w-4 mr-2" /> Add Insurance Details
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" onClick={() => setShowAcceptForm(true)}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Accept Request
                    </Button>
                  )}
                  <Button variant="destructive" className="w-full" onClick={handleReject}>
                    <XCircle className="h-4 w-4 mr-2" /> Reject Request
                  </Button>
                </CardContent>
              </Card>
            )}

            {request.status === 'accepted' && (
              <Card className="border-success/30 bg-success/5">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="font-medium text-success">Accepted</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right — Conversation */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={msg.is_system ? 'text-center' : msg.sender_id === user?.id ? 'text-right' : 'text-left'}>
                    {msg.is_system ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground">
                        <AlertTriangle className="h-3 w-3" />
                        {msg.content}
                        <span className="text-[10px]">{format(new Date(msg.created_at), 'HH:mm')}</span>
                      </div>
                    ) : (
                      <div className={`inline-block max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={sending}
                  />
                  <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
