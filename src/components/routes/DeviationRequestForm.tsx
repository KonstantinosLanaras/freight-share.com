import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Loader2, MapPin, Package, Clock, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeviationRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeId: string;
  carrierId: string;
  shipperId: string;
  maxPallets: number;
  onSuccess?: () => void;
}

export function DeviationRequestForm({
  open,
  onOpenChange,
  routeId,
  carrierId,
  shipperId,
  maxPallets,
  onSuccess,
}: DeviationRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pickupAddress: '',
    palletsRequired: '',
    preferredTimeFrom: '',
    preferredTimeTo: '',
    deviationDescription: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pallets = parseInt(formData.palletsRequired);
    if (!pallets || pallets < 1) {
      toast.error('Please enter a valid number of pallets');
      return;
    }
    
    if (pallets > maxPallets) {
      toast.error(`Maximum ${maxPallets} pallets available on this route`);
      return;
    }

    if (!formData.pickupAddress.trim()) {
      toast.error('Please enter a pickup address');
      return;
    }

    if (!formData.deviationDescription.trim()) {
      toast.error('Please describe the deviation you need');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('deviation_requests')
        .insert({
          route_id: routeId,
          carrier_id: carrierId,
          shipper_id: shipperId,
          pickup_address: formData.pickupAddress.trim(),
          pallets_required: pallets,
          preferred_time_from: formData.preferredTimeFrom || new Date().toISOString(),
          preferred_time_to: formData.preferredTimeTo || new Date().toISOString(),
          deviation_description: formData.deviationDescription.trim(),
          notes: formData.notes.trim() || null,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Pickup request sent to carrier!');
      onOpenChange(false);
      setFormData({
        pickupAddress: '',
        palletsRequired: '',
        preferredTimeFrom: '',
        preferredTimeTo: '',
        deviationDescription: '',
        notes: '',
      });
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting deviation request:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Request Pickup on This Route
          </DialogTitle>
          <DialogDescription>
            Submit a request to the carrier for an additional pickup along their route.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pickupAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Pickup Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="pickupAddress"
              placeholder="Full pickup address including city, postal code, and country"
              className="mt-1"
              value={formData.pickupAddress}
              onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="palletsRequired" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pallets Required <span className="text-destructive">*</span>
            </Label>
            <Input
              id="palletsRequired"
              type="number"
              min="1"
              max={maxPallets}
              placeholder={`1 - ${maxPallets}`}
              className="mt-1"
              value={formData.palletsRequired}
              onChange={(e) => setFormData({ ...formData, palletsRequired: e.target.value })}
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum {maxPallets} pallets available on this route
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferredTimeFrom" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Earliest Pickup
              </Label>
              <Input
                id="preferredTimeFrom"
                type="datetime-local"
                className="mt-1"
                value={formData.preferredTimeFrom}
                onChange={(e) => setFormData({ ...formData, preferredTimeFrom: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <Label htmlFor="preferredTimeTo">Latest Pickup</Label>
              <Input
                id="preferredTimeTo"
                type="datetime-local"
                className="mt-1"
                value={formData.preferredTimeTo}
                onChange={(e) => setFormData({ ...formData, preferredTimeTo: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="deviationDescription" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Deviation Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="deviationDescription"
              placeholder="Describe how far the pickup is from the planned route, accessibility, loading requirements, etc."
              className="mt-1 min-h-[80px]"
              value={formData.deviationDescription}
              onChange={(e) => setFormData({ ...formData, deviationDescription: e.target.value })}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any other information the carrier should know"
              className="mt-1"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
