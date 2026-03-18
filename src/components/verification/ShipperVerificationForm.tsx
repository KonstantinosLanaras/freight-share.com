import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ShieldCheck, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '@/lib/errorUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ShipperVerificationFormProps {
  onSuccess?: () => void;
}

export function ShipperVerificationForm({ onSuccess }: ShipperVerificationFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    legalCompanyName: '',
    vatNumber: '',
    billingAddress: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to complete verification');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update profile with verification details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          legal_company_name: formData.legalCompanyName,
          vat_number: formData.vatNumber,
          billing_address: formData.billingAddress,
          verification_status: 'verified', // Shippers are auto-verified in MVP
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('Business details saved successfully!');
      onSuccess?.();
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(getSafeErrorMessage(error, 'Failed to save business details'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Business Details
        </CardTitle>
        <CardDescription>
          Complete your business details to proceed with payment for shipments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Why we need this</p>
            <p>Your business details are required for invoicing and to ensure secure transactions on the platform.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="legalCompanyName">Legal Company Name <span className="text-destructive">*</span></Label>
            <Input
              id="legalCompanyName"
              placeholder="As registered in your country"
              value={formData.legalCompanyName}
              onChange={(e) => setFormData({ ...formData, legalCompanyName: e.target.value })}
              required
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="vatNumber">VAT Number <span className="text-destructive">*</span></Label>
            <Input
              id="vatNumber"
              placeholder="e.g., DE123456789"
              value={formData.vatNumber}
              onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
              required
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="billingAddress">Billing Address <span className="text-destructive">*</span></Label>
            <Textarea
              id="billingAddress"
              placeholder="Full billing address"
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
              required
              disabled={isSubmitting}
              className="mt-1"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Save Business Details
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}