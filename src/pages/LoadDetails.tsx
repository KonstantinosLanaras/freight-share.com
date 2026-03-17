import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Package, MapPin, Calendar, Euro, Loader2, User, Star,
  Truck, MessageSquare, CheckCircle, CreditCard, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { GoodsConfirmationDialog } from '@/components/payment/GoodsConfirmationDialog';

interface LoadData {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  pallets: number;
  weight_kg: number;
  space_ldm: number | null;
  status: string;
  price: number | null;
  pricing_type: string;
  pickup_date_from: string;
  pickup_date_to: string;
  delivery_date_from: string;
  delivery_date_to: string;
  cargo_type: string;
  cargo_notes: string | null;
  notes: string | null;
  shipper_id: string;
  created_at: string;
}

interface Offer {
  id: string;
  carrier_id: string;
  price: number;
  message: string | null;
  is_accepted: boolean;
  created_at: string;
  route_id: string | null;
  carrier_profile?: {
    full_name: string | null;
    company_name: string | null;
    verification_status: string | null;
  };
}

export default function LoadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [load, setLoad] = useState<LoadData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const isOwner = user && load && user.id === load.shipper_id;

  useEffect(() => {
    if (id) {
      fetchLoad();
      fetchOffers();
    }
    if (user) {
      fetchVerificationStatus();
    }
  }, [id, user]);

  const fetchLoad = async () => {
    try {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      setLoad(data);
    } catch (error) {
      console.error('Error fetching load:', error);
      toast.error('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('load_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch carrier profiles for each offer
      const enriched = await Promise.all(
        (data || []).map(async (offer) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, company_name, verification_status')
            .eq('id', offer.carrier_id)
            .single();
          return { ...offer, carrier_profile: profile || undefined };
        })
      );
      setOffers(enriched);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchVerificationStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('verification_status')
      .eq('id', user.id)
      .single();
    setVerificationStatus(data?.verification_status || 'unverified');
  };

  const handleAcceptOffer = (offer: Offer) => {
    setSelectedOffer(offer);

    if (verificationStatus !== 'verified') {
      toast.info('Please complete business verification before proceeding to payment.');
      navigate(`/dashboard/shipper/verify?returnTo=/load/${id}`);
      return;
    }

    setShowConfirmation(true);
  };

  const handleProceedToPayment = async () => {
    if (!selectedOffer || !load || !user) return;

    setPaymentLoading(true);
    try {
      // 1. Accept the offer
      const { error: offerError } = await supabase
        .from('offers')
        .update({ is_accepted: true })
        .eq('id', selectedOffer.id);
      if (offerError) throw offerError;

      // 2. Update load status
      const { error: loadError } = await supabase
        .from('loads')
        .update({ status: 'accepted' })
        .eq('id', load.id);
      if (loadError) throw loadError;

      // 3. Create shipment
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          load_id: load.id,
          offer_id: selectedOffer.id,
          shipper_id: user.id,
          carrier_id: selectedOffer.carrier_id,
          final_price: selectedOffer.price,
          status: 'accepted',
          payment_status: 'pending',
          terms_version: '1.0',
        })
        .select('id')
        .single();
      if (shipmentError) throw shipmentError;

      // 4. Call payment edge function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-shipment-payment',
        {
          body: {
            shipmentId: shipment.id,
            amount: selectedOffer.price,
            description: `${load.origin_city} → ${load.destination_city} · ${load.pallets} pallets · ${load.cargo_type}`,
            loadId: load.id,
            carrierId: selectedOffer.carrier_id,
          },
        }
      );

      if (paymentError) throw paymentError;

      if (paymentData?.url) {
        window.location.href = paymentData.url;
      } else {
        throw new Error('No payment URL returned');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
      setShowConfirmation(false);
    }
  };

  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (from === to) return format(fromDate, 'MMM d, yyyy');
    return `${format(fromDate, 'MMM d')} – ${format(toDate, 'd, yyyy')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!load) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Load not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const acceptedOffer = offers.find((o) => o.is_accepted);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Load Details
              </h1>
              <p className="text-sm text-muted-foreground">
                {load.origin_city}, {load.origin_country} → {load.destination_city}, {load.destination_country}
              </p>
            </div>
            <Badge className="ml-auto capitalize">{load.status}</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Load info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shipment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Origin</div>
                    <div className="font-medium">{load.origin_city}, {load.origin_country}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Pickup: {formatDateRange(load.pickup_date_from, load.pickup_date_to)}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Destination</div>
                    <div className="font-medium">{load.destination_city}, {load.destination_country}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Delivery: {formatDateRange(load.delivery_date_from, load.delivery_date_to)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">Pallets</div>
                    <div className="font-semibold">{load.pallets}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">Cargo</div>
                    <div className="font-semibold capitalize">{load.cargo_type}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">Weight</div>
                    <div className="font-semibold">{load.weight_kg} kg</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">Price</div>
                    <div className="font-semibold">{load.price ? `€${load.price}` : 'Open'}</div>
                  </div>
                </div>
                {load.notes && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Notes</div>
                    <p className="text-sm">{load.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Offers Section - only for load owner */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Carrier Offers ({offers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {offers.length === 0 ? (
                    <div className="text-center py-8">
                      <Truck className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">No offers yet. Carriers will submit proposals for your load.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          className={`p-4 rounded-lg border ${
                            offer.is_accepted
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30'
                          } transition-colors`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {offer.carrier_profile?.company_name || offer.carrier_profile?.full_name || 'Carrier'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {offer.carrier_profile?.verification_status === 'verified' && (
                                    <Badge variant="outline" className="text-xs text-primary border-primary/30">
                                      <ShieldCheck className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                  <span>{format(new Date(offer.created_at), 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-foreground">€{offer.price}</div>
                              {offer.is_accepted && (
                                <Badge className="bg-primary text-primary-foreground mt-1">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Accepted
                                </Badge>
                              )}
                            </div>
                          </div>
                          {offer.message && (
                            <div className="mt-3 p-3 rounded bg-muted/50 text-sm text-muted-foreground">
                              <MessageSquare className="h-3 w-3 inline mr-1" />
                              {offer.message}
                            </div>
                          )}
                          {/* Accept + Pay button */}
                          {!acceptedOffer && load.status === 'posted' && (
                            <div className="mt-3 flex justify-end">
                              <Button onClick={() => handleAcceptOffer(offer)}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Accept & Proceed to Payment
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Euro className="h-4 w-4 text-primary" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {load.price ? `€${load.price}` : 'Open to offers'}
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {load.pricing_type === 'fixed' ? 'Fixed price' : 'Accepting carrier offers'}
                </p>
                {acceptedOffer && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="text-sm text-muted-foreground">Accepted Offer</div>
                    <div className="text-xl font-bold text-primary">€{acceptedOffer.price}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      by {acceptedOffer.carrier_profile?.company_name || 'Carrier'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Model
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Funds are <span className="font-medium text-foreground">authorised</span> at acceptance but only <span className="font-medium text-foreground">captured on delivery confirmation</span>.</p>
                <p>A 2% platform fee is deducted upon release. You have 48 hours after delivery to raise a dispute.</p>
                <Button variant="link" className="p-0 h-auto text-primary" asChild>
                  <Link to="/payments">Learn more about payments →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Goods Confirmation Dialog */}
      {selectedOffer && (
        <GoodsConfirmationDialog
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          onConfirm={handleProceedToPayment}
          isLoading={paymentLoading}
          cargoType={load.cargo_type}
          price={selectedOffer.price}
        />
      )}
    </div>
  );
}
