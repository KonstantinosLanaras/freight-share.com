import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ShieldCheck, Loader2, Upload, FileText, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const COVERAGE_TYPES = [
  { value: 'cmt_liability', label: 'CMR/CMT Liability' },
  { value: 'general_liability', label: 'General Transport Liability' },
  { value: 'comprehensive', label: 'Comprehensive Liability' },
];

export default function CarrierInsuranceSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingInsurance, setExistingInsurance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    providerName: '',
    policyNumber: '',
    coverageType: 'cargo',
    coverageLimitEur: '',
    expirationDate: '',
  });

  useEffect(() => {
    if (user) fetchExisting();
  }, [user]);

  const fetchExisting = async () => {
    try {
      const { data } = await supabase
        .from('carrier_insurance')
        .select('*')
        .eq('carrier_id', user!.id)
        .maybeSingle();
      
      if (data) {
        setExistingInsurance(data);
        setFormData({
          providerName: data.provider_name,
          policyNumber: data.policy_number || '',
          coverageType: data.coverage_type,
          coverageLimitEur: String(data.coverage_limit_eur),
          expirationDate: data.expiration_date,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
      const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowed.includes(f.type)) { toast.error('PDF, JPEG, or PNG only'); return; }
      setFile(f);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.providerName || !formData.coverageLimitEur || !formData.expirationDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      let documentUrl = existingInsurance?.document_url || null;

      if (file) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('insurance-documents')
          .upload(path, file);
        if (uploadErr) throw uploadErr;
        documentUrl = path;
      }

      const record = {
        carrier_id: user.id,
        provider_name: formData.providerName,
        policy_number: formData.policyNumber || null,
        coverage_type: formData.coverageType,
        coverage_limit_eur: parseFloat(formData.coverageLimitEur),
        expiration_date: formData.expirationDate,
        document_url: documentUrl,
        status: 'provided',
      };

      if (existingInsurance) {
        const { error } = await supabase
          .from('carrier_insurance')
          .update(record)
          .eq('id', existingInsurance.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('carrier_insurance')
          .insert(record);
        if (error) throw error;
      }

      toast.success('Insurance details saved!');
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate('/dashboard/carrier');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save insurance');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <h1 className="text-xl font-heading font-bold text-foreground">
                {existingInsurance ? 'Update Liability Insurance' : 'Carrier Liability Insurance'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Add your transport liability policy to your carrier profile
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <div className="bg-muted/50 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Why insurance matters</p>
            <p>Providing insurance information builds trust with shippers. You must have insurance details on file before accepting load requests.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Insurance Information
            </CardTitle>
            <CardDescription>
              Enter your transport insurance details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="providerName">Insurance Provider <span className="text-destructive">*</span></Label>
                <Input
                  id="providerName"
                  placeholder="e.g., Allianz, AXA, ERGO"
                  value={formData.providerName}
                  onChange={e => setFormData({ ...formData, providerName: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="policyNumber">Policy Number (recommended)</Label>
                <Input
                  id="policyNumber"
                  placeholder="e.g., POL-2026-12345"
                  value={formData.policyNumber}
                  onChange={e => setFormData({ ...formData, policyNumber: e.target.value })}
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Coverage Type <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.coverageType}
                  onValueChange={v => setFormData({ ...formData, coverageType: v })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COVERAGE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="coverageLimit">Coverage Limit (€) <span className="text-destructive">*</span></Label>
                <Input
                  id="coverageLimit"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g., 100000"
                  value={formData.coverageLimitEur}
                  onChange={e => setFormData({ ...formData, coverageLimitEur: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="expirationDate">Expiration Date <span className="text-destructive">*</span></Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Upload Policy Document (optional)</Label>
                <div className="mt-1">
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center py-4">
                      {file ? (
                        <>
                          <FileText className="h-6 w-6 text-primary mb-1" />
                          <p className="text-sm text-foreground font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">Click to change</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-primary">Click to upload</span>
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
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><ShieldCheck className="mr-2 h-4 w-4" /> Save and Continue</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Legal disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-6 italic">
          The carrier is responsible for transport and cargo insurance. Freight Share acts as a platform connecting shippers and carriers and does not provide transport services.
        </p>
      </main>
    </div>
  );
}
