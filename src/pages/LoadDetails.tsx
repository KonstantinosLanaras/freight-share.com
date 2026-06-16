import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, Package, MapPin, Calendar, Euro, Loader2, User, Star,
  Truck, MessageSquare, CheckCircle, CreditCard, ShieldCheck, Send,
  AlertTriangle, Clock, XCircle, X, Reply
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '@/lib/errorUtils';
import { GoodsConfirmationDialog, InsuranceDecision } from '@/components/payment/GoodsConfirmationDialog';
import { VerificationGateDialog } from '@/components/verification/VerificationGateDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// ── Types ──────────────────────────────────────────────────

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

interface CarrierInsuranceInfo {
  provider_name: string;
  coverage_type: string;
  coverage_limit_eur: number;
  expiration_date: string;
  status: string;
  policy_number?: string | null;
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
  carrier_insurance?: CarrierInsuranceInfo | null;
}

// ── Flow states ────────────────────────────────────────────
type FlowState =
  | 'idle'
  | 'verification_gate'
  | 'offer_form'
  | 'counter_offer_form'
  | 'goods_confirmation'
  | 'processing_payment';

type PendingAction =
  | { type: 'make_offer' }
  | { type: 'accept_offer'; offer: Offer }
  | { type: 'counter_offer'; offer: Offer };

// ── Component ──────────────────────────────────────────────

export default function LoadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { isDemoMode, checkVerification, shouldSimulatePayment } = useDemoMode();

  // Data
  const [load, setLoad] = useState<LoadData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  // Flow state machine
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Offer form
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [carrierExistingOffer, setCarrierExistingOffer] = useState<Offer | null>(null);

  // Counter offer
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [submittingCounter, setSubmittingCounter] = useState(false);

  // Payment
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Rejecting
  const [rejectingOfferId, setRejectingOfferId] = useState<string | null>(null);

  const isOwner = user && load && user.id === load.shipper_id;
  const isCarrier = role === 'carrier';

  // ── Data fetching ────────────────────────────────────────

  useEffect(() => {
    if (id) {
      fetchLoad();
      fetchOffers();
    }
    if (user) {
      fetchVerificationStatus();
    }
  }, [id, user]);

  useEffect(() => {
    if (user && isCarrier && offers.length > 0) {
      const existing = offers.find((o) => o.carrier_id === user.id);
      setCarrierExistingOffer(existing || null);
    }
  }, [offers, user, isCarrier]);

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

      const enriched = await Promise.all(
        (data || []).map(async (offer) => {
          const [profileRes, insuranceRes] = await Promise.all([
            supabase.from('public_profiles').select('full_name, company_name, verification_status').eq('id', offer.carrier_id).single(),
            supabase.from('carrier_insurance').select('provider_name, coverage_type, coverage_limit_eur, expiration_date, status, policy_number').eq('carrier_id', offer.carrier_id).maybeSingle(),
          ]);
          return {
            ...offer,
            carrier_profile: profileRes.data || undefined,
            carrier_insurance: insuranceRes.data || null,
          };
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

  // ── Flow control ─────────────────────────────────────────

  const startAction = (action: PendingAction) => {
    if (!user) {
      navigate(`/auth?mode=login&returnTo=${encodeURIComponent(`/load/${id}`)}`);
      return;
    }

    setPendingAction(action);

    // In demo mode, bypass verification entirely
    if (isDemoMode) {
      if (verificationStatus !== 'verified') {
        toast.info('Verification required in live environment', {
          description: 'In beta, this step is bypassed.',
          duration: 3000,
        });
      }
      executeAction(action);
      return;
    }

    // Production: check verification
    if (!checkVerification(verificationStatus)) {
      setFlowState('verification_gate');
      return;
    }

    executeAction(action);
  };

  const executeAction = (action: PendingAction) => {
    switch (action.type) {
      case 'make_offer':
        if (load?.pricing_type === 'fixed' && load.price) {
          setOfferAmount(String(load.price));
        }
        setFlowState('offer_form');
        break;

      case 'accept_offer':
        setSelectedOffer(action.offer);
        setFlowState('goods_confirmation');
        break;

      case 'counter_offer':
        setSelectedOffer(action.offer);
        setCounterAmount(String(Math.round(action.offer.price * 0.9))); // suggest 10% lower
        setCounterMessage('');
        setFlowState('counter_offer_form');
        break;
    }
  };

  const resetFlow = () => {
    setFlowState('idle');
    setPendingAction(null);
    setSelectedOffer(null);
    setOfferAmount('');
    setOfferMessage('');
    setCounterAmount('');
    setCounterMessage('');
  };

  // ── Carrier: Submit offer ────────────────────────────────

  const handleSubmitOffer = async () => {
    if (!user || !load || !offerAmount) return;

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid offer amount.');
      return;
    }

    setSubmittingOffer(true);
    try {
      const { error } = await supabase.from('offers').insert({
        load_id: load.id,
        carrier_id: user.id,
        price: amount,
        message: offerMessage.trim() || null,
      });
      if (error) throw error;

      toast.success('Offer submitted successfully!');
      resetFlow();
      fetchOffers();
    } catch (error: any) {
      console.error('Offer error:', error);
      toast.error(getSafeErrorMessage(error, 'Failed to submit offer'));
    } finally {
      setSubmittingOffer(false);
    }
  };

  // ── Shipper: Reject offer ────────────────────────────────

  const handleRejectOffer = async (offerId: string) => {
    setRejectingOfferId(offerId);
    try {
      // We mark rejected by deleting the offer (or we could add a status field)
      // For now, delete the offer so carrier can re-submit
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', offerId);
      if (error) throw error;

      toast.success('Offer rejected');
      fetchOffers();
    } catch (error: any) {
      toast.error(getSafeErrorMessage(error, 'Failed to reject offer'));
    } finally {
      setRejectingOfferId(null);
    }
  };

  // ── Shipper: Counter offer ───────────────────────────────

  const handleSubmitCounterOffer = async () => {
    if (!user || !load || !selectedOffer || !counterAmount) return;

    const amount = parseFloat(counterAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid counter amount.');
      return;
    }

    setSubmittingCounter(true);
    try {
      // Update the existing offer price as a counter
      const { error } = await supabase
        .from('offers')
        .update({
          price: amount,
          message: counterMessage.trim()
            ? `Counter offer: ${counterMessage.trim()}`
            : `Counter offer from shipper: €${amount}`,
        })
        .eq('id', selectedOffer.id);
      if (error) throw error;

      toast.success('Counter offer sent!');
      resetFlow();
      fetchOffers();
    } catch (error: any) {
      toast.error(getSafeErrorMessage(error, 'Failed to send counter offer'));
    } finally {
      setSubmittingCounter(false);
    }
  };

  // ── Shipper: Accept offer → Goods confirmation → Payment ─

  const handleProceedToPayment = async (insuranceDecision?: InsuranceDecision) => {
    if (!selectedOffer || !load || !user) return;

    setPaymentLoading(true);
    setFlowState('processing_payment');

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
          status: shouldSimulatePayment() ? 'paid' : 'accepted',
          payment_status: shouldSimulatePayment() ? 'paid' : 'pending',
          terms_version: '1.0',
        })
        .select('id')
        .single();
      if (shipmentError) throw shipmentError;

      // 4. Beta mode: simulate payment success
      if (shouldSimulatePayment()) {
        toast.success('Beta: Payment simulated successfully!', {
          description: 'In production, you would be redirected to Stripe checkout.',
          duration: 5000,
        });
        navigate(`/shipment/${shipment.id}`);
        return;
      }

      // 5. Production: real payment
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
      toast.error(getSafeErrorMessage(error, 'Failed to initiate payment. Please try again.'));
      setFlowState('goods_confirmation');
    } finally {
      setPaymentLoading(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────

  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (from === to) return format(fromDate, 'MMM d, yyyy');
    return `${format(fromDate, 'MMM d')} – ${format(toDate, 'd, yyyy')}`;
  };

  // ── Loading / Not found ──────────────────────────────────

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
  const isPosted = load.status === 'posted';
  const isFixed = load.pricing_type === 'fixed';

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {load.origin_city} → {load.destination_city}
              </h1>
              <p className="text-sm text-muted-foreground">
                {load.origin_country} → {load.destination_country} · {load.pallets} pallets · {load.cargo_type}
              </p>
            </div>
            <Badge className="capitalize">{load.status}</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Load info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipment Info Card */}
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
                {load.cargo_notes && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Cargo Notes</div>
                    <p className="text-sm">{load.cargo_notes}</p>
                  </div>
                )}
                {load.notes && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Additional Notes</div>
                    <p className="text-sm">{load.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Carrier: Existing Offer Status ── */}
            {isCarrier && carrierExistingOffer && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {carrierExistingOffer.is_accepted ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Clock className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {carrierExistingOffer.is_accepted ? 'Your Offer Was Accepted!' : 'Offer Submitted'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {carrierExistingOffer.is_accepted
                          ? 'The shipper has accepted your offer. Check your shipments for next steps.'
                          : 'Your offer is being reviewed by the shipper.'}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="text-xl font-bold text-foreground">€{carrierExistingOffer.price}</span>
                        <Badge variant={carrierExistingOffer.is_accepted ? 'default' : 'outline'}>
                          {carrierExistingOffer.is_accepted ? 'Accepted' : 'Pending'}
                        </Badge>
                      </div>
                      {carrierExistingOffer.message && (
                        <p className="text-sm text-muted-foreground mt-2 italic">"{carrierExistingOffer.message}"</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Shipper: Offers Section ── */}
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
                      {offers.map((offer) => {
                        const insuranceExpired = offer.carrier_insurance
                          ? new Date(offer.carrier_insurance.expiration_date) < new Date()
                          : false;

                        return (
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
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
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

                            {/* Carrier Insurance Info */}
                            <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border">
                              <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                {offer.carrier_insurance && !insuranceExpired ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-foreground font-medium">
                                      Carrier liability coverage up to €{offer.carrier_insurance.coverage_limit_eur.toLocaleString()}
                                    </span>
                                    <Badge variant="outline" className="text-xs text-primary border-primary/30">
                                      {offer.carrier_insurance.status === 'verified' ? 'Verified' : 'Provided'}
                                    </Badge>
                                  </div>
                                ) : insuranceExpired ? (
                                  <span className="text-destructive text-sm">Carrier insurance expired</span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">No carrier insurance information provided</span>
                                )}
                              </div>
                            </div>

                            {offer.message && (
                              <div className="mt-3 p-3 rounded bg-muted/50 text-sm text-muted-foreground">
                                <MessageSquare className="h-3 w-3 inline mr-1" />
                                {offer.message}
                              </div>
                            )}

                            {/* Action buttons for shipper */}
                            {!acceptedOffer && isPosted && (
                              <div className="mt-4 flex flex-wrap gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectOffer(offer.id)}
                                  disabled={rejectingOfferId === offer.id}
                                >
                                  {rejectingOfferId === offer.id ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Reject
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startAction({ type: 'counter_offer', offer })}
                                >
                                  <Reply className="h-4 w-4 mr-1" />
                                  Counter Offer
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => startAction({ type: 'accept_offer', offer })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Accept & Proceed
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-6">
            {/* Pricing Card */}
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
                  {isFixed ? 'Fixed price' : 'Accepting carrier offers'}
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

                {/* Carrier CTAs in sidebar (desktop) */}
                {isCarrier && isPosted && !carrierExistingOffer && (
                  <div className="mt-6 space-y-3 hidden lg:block">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => startAction({ type: 'make_offer' })}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isFixed ? `Offer at €${load.price}` : 'Make an Offer'}
                    </Button>
                    {isFixed && (
                      <p className="text-xs text-muted-foreground text-center">
                        You can also propose a different amount
                      </p>
                    )}
                  </div>
                )}

                {/* Shipper hint */}
                {isOwner && isPosted && isFixed && offers.length > 0 && !acceptedOffer && (
                  <div className="mt-6 hidden lg:block">
                    <p className="text-xs text-muted-foreground mb-2">
                      Accept, reject, or counter a carrier offer above to proceed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transaction Flow Status */}
            {isOwner && offers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4 text-primary" />
                    Transaction Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Load Posted', done: true },
                      { label: 'Offers Received', done: offers.length > 0 },
                      { label: 'Offer Accepted', done: !!acceptedOffer },
                      { label: 'Terms & Insurance', done: !!acceptedOffer },
                      { label: 'Payment Complete', done: load.status !== 'posted' && !!acceptedOffer },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          step.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {step.done ? <CheckCircle className="h-3.5 w-3.5" /> : <span className="text-xs">{i + 1}</span>}
                        </div>
                        <span className={`text-sm ${step.done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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

            {/* Legal notice */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
              <p>
                The carrier is responsible for transport and cargo insurance. FreightShare acts as a platform connecting shippers and carriers and does not provide transport services.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Sticky Mobile CTA Bar ── */}
      {isCarrier && isPosted && !carrierExistingOffer && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 lg:hidden z-50">
          <div className="container mx-auto flex gap-3">
            <Button
              className="flex-1"
              size="lg"
              onClick={() => startAction({ type: 'make_offer' })}
            >
              <Send className="h-4 w-4 mr-2" />
              {isFixed ? `Offer at €${load.price}` : 'Make an Offer'}
            </Button>
          </div>
        </div>
      )}

      {/* ── FLOW DIALOGS ── */}

      {/* 1. Verification Gate */}
      <VerificationGateDialog
        open={flowState === 'verification_gate'}
        onOpenChange={(open) => {
          if (!open) resetFlow();
        }}
        verificationStatus={verificationStatus}
        role={role as 'shipper' | 'carrier' | null}
        returnPath={`/load/${id}`}
      />

      {/* 2. Make Offer Dialog (Carrier) */}
      <Dialog
        open={flowState === 'offer_form'}
        onOpenChange={(open) => {
          if (!open) resetFlow();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Make an Offer
            </DialogTitle>
            <DialogDescription>
              Submit your price proposal for this load.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Load summary */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border text-sm">
              <div className="font-medium text-foreground mb-1">
                {load.origin_city} → {load.destination_city}
              </div>
              <div className="text-muted-foreground">
                {load.pallets} pallets · {load.cargo_type} · {load.weight_kg} kg
              </div>
              {load.price && (
                <div className="mt-2 text-foreground">
                  Listed price: <span className="font-bold">€{load.price}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-amount">Your Offer (€)</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="offer-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter your price"
                  className="pl-10"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-message">Message to Shipper (optional)</Label>
              <Textarea
                id="offer-message"
                placeholder="Add a note about your offer, vehicle, availability..."
                rows={3}
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                maxLength={500}
              />
            </div>

            {isDemoMode && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning-foreground flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                <span>Beta — This offer will be created in the database and visible to the shipper.</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={resetFlow} disabled={submittingOffer}>
              Cancel
            </Button>
            <Button onClick={handleSubmitOffer} disabled={!offerAmount || submittingOffer}>
              {submittingOffer ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Offer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. Counter Offer Dialog (Shipper) */}
      <Dialog
        open={flowState === 'counter_offer_form'}
        onOpenChange={(open) => {
          if (!open) resetFlow();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="h-5 w-5 text-primary" />
              Counter Offer
            </DialogTitle>
            <DialogDescription>
              Propose a different price to the carrier.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedOffer && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Carrier's offer:</span>
                  <span className="font-bold text-foreground">€{selectedOffer.price}</span>
                </div>
                <div className="text-muted-foreground mt-1">
                  by {selectedOffer.carrier_profile?.company_name || 'Carrier'}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="counter-amount">Your Counter Price (€)</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="counter-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter your counter price"
                  className="pl-10"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="counter-message">Message (optional)</Label>
              <Textarea
                id="counter-message"
                placeholder="Explain your counter offer..."
                rows={3}
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={resetFlow} disabled={submittingCounter}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCounterOffer} disabled={!counterAmount || submittingCounter}>
              {submittingCounter ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Counter Offer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. Goods Confirmation → Insurance → Payment (Shipper) */}
      {selectedOffer && (
        <GoodsConfirmationDialog
          open={flowState === 'goods_confirmation' || flowState === 'processing_payment'}
          onOpenChange={(open) => {
            if (!open && flowState !== 'processing_payment') resetFlow();
          }}
          onConfirm={(decision) => handleProceedToPayment(decision)}
          isLoading={paymentLoading}
          cargoType={load.cargo_type}
          price={selectedOffer.price}
          weightKg={load.weight_kg}
          carrierInsurance={selectedOffer.carrier_insurance || undefined}
          isDemoMode={isDemoMode}
        />
      )}
    </div>
  );
}
