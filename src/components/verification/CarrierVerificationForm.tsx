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

interface CarrierVerificationFormProps {
  onSuccess?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'insurance', label: 'Transport Insurance Certificate' },
  { value: 'license', label: 'Transport License' },
  { value: 'registration', label: 'Company Registration Extract' },
];

export function CarrierVerificationForm({ onSuccess }: CarrierVerificationFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    legalCompanyName: '',
    vatNumber: '',
    registeredAddress: '',
    documentType: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      // Validate file type
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
      toast.error('Please log in to submit verification');
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
      // Upload document to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update profile with verification details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          legal_company_name: formData.legalCompanyName,
          vat_number: formData.vatNumber,
          registered_address: formData.registeredAddress,
          verification_status: 'pending',
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create verification record
      const { error: verificationError } = await supabase
        .from('carrier_verifications')
        .insert({
          carrier_id: user.id,
          document_type: formData.documentType,
          document_url: filePath,
          status: 'pending',
        });

      if (verificationError) throw verificationError;

      toast.success('Verification submitted successfully! We will review your documents shortly.');
      onSuccess?.();
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to submit verification');
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
          Complete verification to accept paid shipments. This protects both you and your clients.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Why verification?</p>
            <p>Verification builds trust in the marketplace. Verified carriers can accept paid shipments, and shippers can transact with confidence knowing their freight is handled by a legitimate business.</p>
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
            <Label htmlFor="registeredAddress">Registered Address <span className="text-destructive">*</span></Label>
            <Textarea
              id="registeredAddress"
              placeholder="Full registered business address"
              value={formData.registeredAddress}
              onChange={(e) => setFormData({ ...formData, registeredAddress: e.target.value })}
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
              Upload one of the above documents to verify your business
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