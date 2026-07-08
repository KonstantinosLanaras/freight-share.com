import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Package, Truck, MapPin, Calendar, Euro, MessageSquare,
  CheckCircle, Clock, FileText, Star, User, HelpCircle, Navigation,
  AlertTriangle, Loader2, FlaskConical
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { supabase } from '@/integrations/supabase/client';
import { DetailedRatingForm, DetailedRatingDisplay } from '@/components/ratings';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '@/lib/errorUtils';
import { CounterpartyCard } from '@/components/profile/CounterpartyCard';

interface ShipmentData {
  id: string;
  load_id: string;
  offer_id: string;
  shipper_id: string;
  carrier_id: string;
  status: string;
  payment_status: string;
  final_price: number;
  created_at: string;
  updated_at: string;
  payment_reference: string | null;
  terms_version: string | null;
  dispute_status: string | null;
  dispute_reason: string | null;
  delivery_marked_at: string | null;
}

interface LoadData {
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  pallets: number;
  cargo_type: string;
  weight_kg: number;
  pickup_date_from: string;
  delivery_date_from: string;
}

interface ProfileData {
  full_name: string | null;
  company_name: string | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  posted: { label: 'Posted', className: 'bg-muted text-muted-foreground' },
  accepted: { label: 'Accepted', className: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Paid', className: 'bg-primary/10 text-primary' },
  picked_up: { label: 'In Transit', className: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', className: 'bg-success/10 text-success' },
  completed: { label: 'Completed', className: 'bg-success text-success-foreground' },
};

export default function ShipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentResult = searchParams.get('payment');
  const { user, role } = useAuth();
  const { isDemoMode } = useDemoMode();

  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [load, setLoad] = useState<LoadData | null>(null);
  const [shipperProfile, setShipperProfile] = useState<ProfileData | null>(null);
  const [carrierProfile, setCarrierProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);
  const [otherPartyRating, setOtherPartyRating] = useState<any>(null);

  const [timestamps, setTimestamps] = useState<{ status: string; created_at: string }[]>([]);

  const backPath = role === 'carrier' ? '/dashboard/carrier/shipments' : '/dashboard/shipper/shipments';

  useEffect(() => {
    if (id) fetchShipmentData();
  }, [id]);

  // Verify Stripe payment after redirect back from Checkout
  useEffect(() => {
    if (!id || paymentResult !== 'success') return;
    (async () => {
      try {
        await supabase.functions.invoke('verify-shipment-payment', {
          body: { shipmentId: id },
        });
      } catch (err) {
        console.error('Payment verification failed:', err);
      } finally {
        // Refresh shipment to pick up updated payment_status
        fetchShipmentData();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, paymentResult]);

  const dismissPaymentBanner = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('payment');
    setSearchParams(next, { replace: true });
  };


  const fetchShipmentData = async () => {
    try {
      // Fetch shipment
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', id!)
        .single();
      if (shipmentError) throw shipmentError;
      setShipment(shipmentData);

      // Fetch load, profiles, timestamps in parallel
      const [loadRes, shipperRes, carrierRes, tsRes, myRatingRes, theirRatingRes] = await Promise.all([
        supabase.from('loads').select('origin_city, origin_country, destination_city, destination_country, pallets, cargo_type, weight_kg, pickup_date_from, delivery_date_from').eq('id', shipmentData.load_id).single(),
        supabase.from('public_profiles').select('full_name, company_name').eq('id', shipmentData.shipper_id).single(),
        supabase.from('public_profiles').select('full_name, company_name').eq('id', shipmentData.carrier_id).single(),
        supabase.from('shipment_timestamps').select('status, created_at').eq('shipment_id', id!).order('created_at', { ascending: true }),
        user ? supabase.from('detailed_ratings').select('*').eq('shipment_id', id!).eq('rater_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
        user ? supabase.from('detailed_ratings').select('*').eq('shipment_id', id!).eq('rated_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      setLoad(loadRes.data);
      setShipperProfile(shipperRes.data);
      setCarrierProfile(carrierRes.data);
      setTimestamps(tsRes.data || []);
      setExistingRating(myRatingRes.data);
      setOtherPartyRating(theirRatingRes.data);
    } catch (error) {
      console.error('Error fetching shipment:', error);
      toast.error('Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!shipment || !user) return;
    setUpdating(true);
    try {
      const { error: shipmentError } = await supabase
        .from('shipments')
        .update({ status: newStatus as any, ...(newStatus === 'delivered' ? { delivery_marked_at: new Date().toISOString() } : {}) })
        .eq('id', shipment.id);
      if (shipmentError) throw shipmentError;

      // Record timestamp
      await supabase.from('shipment_timestamps').insert({
        shipment_id: shipment.id,
        status: newStatus as any,
        changed_by: user.id,
      });

      if (newStatus === 'completed') {
        // Release payment
        if (!isDemoMode) {
          await supabase.functions.invoke('release-payment', {
            body: { shipmentId: shipment.id },
          });
        }
        toast.success(isDemoMode ? 'Beta: Delivery confirmed & payment released (simulated)' : 'Delivery confirmed & payment released!');
      } else {
        toast.success(`Shipment marked as ${newStatus.replace('_', ' ')}`);
      }

      fetchShipmentData();
    } catch (error: any) {
      toast.error(getSafeErrorMessage(error, 'Failed to update status'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shipment || !load) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Shipment not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const statusInfo = statusConfig[shipment.status] || statusConfig.posted;
  const canRate = shipment.status === 'completed' && !existingRating;
  const ratedPartyId = role === 'carrier' ? shipment.shipper_id : shipment.carrier_id;
  const ratedPartyName = role === 'carrier'
    ? (shipperProfile?.company_name || shipperProfile?.full_name || 'Shipper')
    : (carrierProfile?.company_name || carrierProfile?.full_name || 'Carrier');

  // Build timeline from real data
  const timelineSteps = [
    { status: 'Accepted', done: true, date: shipment.created_at },
    { status: 'Paid', done: ['paid', 'picked_up', 'delivered', 'completed'].includes(shipment.status), date: timestamps.find(t => t.status === 'paid')?.created_at },
    { status: 'Picked Up', done: ['picked_up', 'delivered', 'completed'].includes(shipment.status), date: timestamps.find(t => t.status === 'picked_up')?.created_at },
    { status: 'Delivered', done: ['delivered', 'completed'].includes(shipment.status), date: shipment.delivery_marked_at || timestamps.find(t => t.status === 'delivered')?.created_at },
    { status: 'Completed', done: shipment.status === 'completed', date: timestamps.find(t => t.status === 'completed')?.created_at },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-heading font-bold text-foreground">
                    {load.origin_city} → {load.destination_city}
                  </h1>
                  <Badge className={statusInfo.className}>
                    {statusInfo.label}
                  </Badge>
                  {isDemoMode && (
                    <Badge variant="outline" className="border-warning/50 text-warning">
                      <FlaskConical className="h-3 w-3 mr-1" />
                      Demo
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {load.origin_country} → {load.destination_country} · {load.pallets} pallets · {load.cargo_type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/help">
                  <HelpCircle className="h-4 w-4" />
                  Get Help
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {paymentResult === 'success' && (
          <div className="mb-6 rounded-lg border border-success/30 bg-success/10 p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Payment confirmed</div>
              <div className="text-sm text-muted-foreground">
                Your carrier has been notified. Funds are held securely and will be released on delivery confirmation.
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={dismissPaymentBanner}>Dismiss</Button>
          </div>
        )}
        {paymentResult === 'cancelled' && (
          <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Payment cancelled</div>
              <div className="text-sm text-muted-foreground">
                You cancelled the checkout. You can retry payment at any time to confirm this shipment.
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={dismissPaymentBanner}>Dismiss</Button>
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shipment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Origin</div>
                    <div className="font-medium">{load.origin_city}, {load.origin_country}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Pickup: {format(new Date(load.pickup_date_from), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Destination</div>
                    <div className="font-medium">{load.destination_city}, {load.destination_country}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Delivery: {format(new Date(load.delivery_date_from), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Pallets</div>
                    <div className="font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      {load.pallets}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Cargo Type</div>
                    <div className="font-medium capitalize">{load.cargo_type}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Agreed Price</div>
                    <div className="font-medium flex items-center gap-2">
                      <Euro className="h-4 w-4 text-primary" />
                      {shipment.final_price}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Status Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timelineSteps.map((item, index) => {
                    const isCurrent = item.done && (index === timelineSteps.length - 1 || !timelineSteps[index + 1].done);
                    return (
                      <div key={item.status} className="flex gap-4">
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.done 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                            {item.done ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          {index < timelineSteps.length - 1 && (
                            <div className={`absolute top-10 left-1/2 w-0.5 h-8 -translate-x-1/2 ${
                              item.done ? 'bg-primary/50' : 'bg-border'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className={`font-medium ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {item.status}
                            {isCurrent && (
                              <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                            )}
                          </div>
                          {item.date && (
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(item.date), 'MMM d, yyyy HH:mm')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Transaction Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Transaction Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transport cost</span>
                    <span className="font-medium">€{shipment.final_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform fee (2%)</span>
                    <span className="font-medium">€{(shipment.final_price * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-bold">
                    <span>Carrier payout</span>
                    <span>€{(shipment.final_price * 0.98).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment status</span>
                    <Badge variant="outline" className="capitalize">{shipment.payment_status}</Badge>
                  </div>
                  {shipment.terms_version && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Terms version</span>
                      <span>v{shipment.terms_version}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rating Section */}
            {shipment.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-warning" />
                    Ratings & Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {showRatingForm && user ? (
                    <DetailedRatingForm
                      shipmentId={id || ''}
                      raterId={user.id}
                      ratedId={ratedPartyId}
                      raterRole={role as 'shipper' | 'carrier'}
                      ratedName={ratedPartyName}
                      onSuccess={() => {
                        setShowRatingForm(false);
                        setExistingRating({ submitted: true });
                      }}
                      onCancel={() => setShowRatingForm(false)}
                    />
                  ) : existingRating ? (
                    <div className="p-4 bg-success/10 rounded-lg">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">You've already rated this shipment</span>
                      </div>
                    </div>
                  ) : canRate ? (
                    <div className="text-center py-4">
                      <Star className="h-10 w-10 text-warning mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">
                        Rate your experience with the {role === 'carrier' ? 'shipper' : 'carrier'}
                      </p>
                      <Button onClick={() => setShowRatingForm(true)}>
                        <Star className="h-4 w-4 mr-2" />
                        Leave a Rating
                      </Button>
                    </div>
                  ) : null}

                  {otherPartyRating && (
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Rating from {role === 'carrier' ? 'Shipper' : 'Carrier'}
                      </h4>
                      <DetailedRatingDisplay
                        timeliness={otherPartyRating.timeliness_score}
                        communication={otherPartyRating.communication_score}
                        reliability={otherPartyRating.reliability_score}
                        accuracy={otherPartyRating.accuracy_score}
                        comment={otherPartyRating.comment}
                        raterRole={otherPartyRating.rater_role}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Parties & Actions */}
          <div className="space-y-6">
            {/* Shipper */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4 text-primary" />
                  Shipper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CounterpartyCard userId={shipment.shipper_id} role="shipper" variant="inline" />
              </CardContent>
            </Card>

            {/* Carrier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-4 w-4 text-primary" />
                  Carrier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CounterpartyCard userId={shipment.carrier_id} role="carrier" variant="inline" />
              </CardContent>
            </Card>


            {/* Payment Status */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-primary capitalize">
                      Payment {shipment.payment_status}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      €{shipment.final_price} — {shipment.payment_status === 'paid' ? 'executes on delivery confirmation' : shipment.payment_status}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Carrier: Mark as Picked Up */}
                {role === 'carrier' && shipment.status === 'paid' && (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handleStatusUpdate('picked_up')}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Truck className="h-4 w-4 mr-2" />}
                    Mark as Picked Up
                  </Button>
                )}

                {/* Carrier: Mark as Delivered */}
                {role === 'carrier' && shipment.status === 'picked_up' && (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handleStatusUpdate('delivered')}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Mark as Delivered
                  </Button>
                )}
                
                {/* Shipper: Confirm Delivery */}
                {role === 'shipper' && shipment.status === 'delivered' && (
                  <Button
                    variant="default"
                    className="w-full bg-success hover:bg-success/90"
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Confirm Delivery & Release Payment
                  </Button>
                )}
                
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/dashboard/${role === 'carrier' ? 'carrier' : 'shipper'}/messages/${id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message {role === 'carrier' ? 'Shipper' : 'Carrier'}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Dispute Section */}
            {role === 'shipper' && shipment.status === 'delivered' && (
              <Card className="border-warning/30 bg-warning/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Dispute Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    If there's an issue with this delivery, you can raise a dispute within 48 hours. 
                    This will pause payment execution while the issue is reviewed.
                  </p>
                  <Button variant="outline" className="w-full border-warning/50 text-warning hover:bg-warning/10">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Raise Dispute
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Help Link */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Need Help?</div>
                    <div className="text-xs text-muted-foreground">
                      Report an issue with this shipment
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3" asChild>
                  <Link to="/help">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Get Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
