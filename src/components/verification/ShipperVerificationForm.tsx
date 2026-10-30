import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, FileText, ShieldCheck, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '@/lib/errorUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ShipperVerificationFormProps {
  onSuccess?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'registration', label: 'Company Registration Extract' },
  { value: 'vat_certificate', label: 'VAT Certificate' },
  { value: 'trade_license', label: 'Trade License' },
  { value: 'other', label: 'Other Business Document' },
];

export function ShipperVerificationForm({ onSuccess }: ShipperVerificationFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    legalCompanyName: '',
    vatNumber: '',
    billingAddress: '',
    documentType: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please upload a PDF, JPEG, or PNG file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to complete verification');
      return;
    }

    if (!file) {
      toast.error('Please upload a verification document');
      return;
    }

    if (!formData.documentType) {
      toast.error('Please select a document type');
      return;
    }

    setIsSubmitting(true);

    try {
      // Set profile to pending immediately so the banner appears even if upload fails
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          legal_company_name: formData.legalCompanyName,
          vat_number: formData.vatNumber,
          billing_address: formData.billingAddress,
          verification_status: 'pending',
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: verificationError } = await supabase
        .from('shipper_verifications')
        .upsert({
          shipper_id: user.id,
          document_type: formData.documentType,
          document_url: filePath,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          rejection_reason: null,
        }, { onConflict: 'shipper_id' });

      if (verificationError) throw verificationError;

      toast.success('Verification submitted! We will review your documents shortly.');
      onSuccess?.();
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(getSafeErrorMessage(error, 'Failed to submit verification'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Business Verification
        </CardTitle>
        <CardDescription>
          Complete verification to make payments for shipments. This keeps the marketplace trustworthy for everyone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Why we need this</p>
            <p>Your business details and a supporting document are required for invoicing and to ensure secure transactions on the platform.</p>
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

          <div>
            <Label>Document Type <span className="text-destructive">*</span></Label>
            <Select
              value={formData.documentType}
              onValueChange={(value) => setFormData({ ...formData, documentType: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Upload one document to verify your business
            </p>
          </div>

          <div>
            <Label>Upload Document <span className="text-destructive">*</span></Label>
            <div className="mt-1">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <FileText className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm text-foreground font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-primary">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, JPEG, or PNG (max 10MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Submit for Verification
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}