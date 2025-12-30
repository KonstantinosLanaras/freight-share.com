import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MapPin, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Loader2,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeviationRequest {
  id: string;
  route_id: string;
  shipper_id: string;
  carrier_id: string;
  pickup_address: string;
  pallets_required: number;
  preferred_time_from: string;
  preferred_time_to: string;
  deviation_description: string;
  notes: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offer';
  carrier_response: string | null;
  counter_offer_price: number | null;
  counter_offer_conditions: string | null;
  created_at: string;
  shipper?: {
    full_name: string | null;
    company_name: string | null;
  };
}

interface DeviationRequestCardProps {
  request: DeviationRequest;
  isCarrier: boolean;
  onUpdate?: () => void;
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  counter_offer: { label: 'Counter Offer', color: 'bg-primary/10 text-primary', icon: MessageSquare },
};

export function DeviationRequestCard({ request, isCarrier, onUpdate }: DeviationRequestCardProps) {
  const [counterOfferOpen, setCounterOfferOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [counterOffer, setCounterOffer] = useState({
    price: '',
    conditions: '',
  });

  const statusInfo = statusConfig[request.status];
  const StatusIcon = statusInfo.icon;

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      // Update request status
      const { error: requestError } = await supabase
        .from('deviation_requests')
        .update({ 
          status: 'accepted',
          carrier_response: 'Request accepted'
        })
        .eq('id', request.id);

      if (requestError) throw requestError;

      // Reduce available pallets on the route
      const { data: route, error: routeError } = await supabase
        .from('routes')
        .select('available_pallets')
        .eq('id', request.route_id)
        .single();

      if (routeError) throw routeError;

      const newPallets = Math.max(0, (route?.available_pallets || 0) - request.pallets_required);
      
      await supabase
        .from('routes')
        .update({ available_pallets: newPallets })
        .eq('id', request.route_id);

      toast.success('Request accepted! Available capacity updated.');
      onUpdate?.();
    } catch (error: any) {
      console.error('Error accepting request:', error);
      toast.error(error.message || 'Failed to accept request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('deviation_requests')
        .update({ 
          status: 'rejected',
          carrier_response: 'Request rejected'
        })
        .eq('id', request.id);

      if (error) throw error;

      toast.success('Request rejected');
      onUpdate?.();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'Failed to reject request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('deviation_requests')
        .update({ 
          status: 'counter_offer',
          counter_offer_price: counterOffer.price ? parseFloat(counterOffer.price) : null,
          counter_offer_conditions: counterOffer.conditions.trim() || null,
          carrier_response: 'Counter offer sent'
        })
        .eq('id', request.id);

      if (error) throw error;

      toast.success('Counter offer sent');
      setCounterOfferOpen(false);
      onUpdate?.();
    } catch (error: any) {
      console.error('Error sending counter offer:', error);
      toast.error(error.message || 'Failed to send counter offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              {request.shipper?.company_name || request.shipper?.full_name || 'Shipper'}
            </CardTitle>
            <Badge className={statusInfo.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">Pickup Address</div>
                <div className="text-muted-foreground">{request.pickup_address}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{request.pallets_required} pallets</span>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">Preferred Time</div>
                <div className="text-muted-foreground">
                  {format(new Date(request.preferred_time_from), 'MMM d, HH:mm')} - {format(new Date(request.preferred_time_to), 'MMM d, HH:mm')}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="font-medium mb-1">Deviation Description</div>
              <div className="text-muted-foreground">{request.deviation_description}</div>
            </div>

            {request.notes && (
              <div>
                <div className="font-medium mb-1">Additional Notes</div>
                <div className="text-muted-foreground">{request.notes}</div>
              </div>
            )}

            {request.status === 'counter_offer' && (
              <div className="pt-2 border-t border-border bg-primary/5 -mx-4 px-4 py-3 rounded-b-lg">
                <div className="font-medium text-primary mb-2">Counter Offer</div>
                {request.counter_offer_price && (
                  <div className="text-lg font-semibold">€{request.counter_offer_price.toFixed(2)}</div>
                )}
                {request.counter_offer_conditions && (
                  <div className="text-muted-foreground mt-1">{request.counter_offer_conditions}</div>
                )}
              </div>
            )}
          </div>

          {isCarrier && request.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={handleAccept}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setCounterOfferOpen(true)}
                disabled={isSubmitting}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Counter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-destructive hover:text-destructive"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Requested {format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}
          </div>
        </CardContent>
      </Card>

      <Dialog open={counterOfferOpen} onOpenChange={setCounterOfferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Counter Offer</DialogTitle>
            <DialogDescription>
              Propose alternative terms for this pickup request.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCounterOffer} className="space-y-4">
            <div>
              <Label htmlFor="counterPrice">Proposed Price (€)</Label>
              <Input
                id="counterPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 150.00"
                className="mt-1"
                value={counterOffer.price}
                onChange={(e) => setCounterOffer({ ...counterOffer, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="counterConditions">Conditions / Modifications</Label>
              <Textarea
                id="counterConditions"
                placeholder="Describe any changes to timing, pickup location, or other conditions"
                className="mt-1"
                value={counterOffer.conditions}
                onChange={(e) => setCounterOffer({ ...counterOffer, conditions: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCounterOfferOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Counter Offer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
