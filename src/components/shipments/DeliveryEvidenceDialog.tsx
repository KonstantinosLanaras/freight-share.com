import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Camera, Loader2, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SignaturePad, type SignaturePadHandle } from './SignaturePad';

interface DeliveryEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipmentId: string;
  kind: 'pickup' | 'delivery';
  onConfirm: () => void;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

function getCurrentPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null), // permission denied or unavailable -- don't block submission
      { timeout: 8000 }
    );
  });
}

export function DeliveryEvidenceDialog({ open, onOpenChange, shipmentId, kind, onConfirm }: DeliveryEvidenceDialogProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [condition, setCondition] = useState<'good' | 'damaged'>('good');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const signatureRef = useRef<SignaturePadHandle>(null);

  const isDelivery = kind === 'delivery';
  const title = isDelivery ? 'Confirm Delivery' : 'Confirm Pickup';

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error('Photo must be under 10MB'); return; }
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setSignerName('');
    setCondition('good');
    setNotes('');
    signatureRef.current?.clear();
  };

  const handleSubmit = async () => {
    if (!photo) { toast.error('A photo is required to confirm this step'); return; }
    if (isDelivery && !signerName.trim()) { toast.error("Recipient's name is required"); return; }
    const signatureDataUrl = isDelivery ? signatureRef.current?.toDataURL() : null;
    if (isDelivery && !signatureDataUrl) { toast.error('A signature is required to confirm delivery'); return; }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const position = await getCurrentPosition();

      const photoPath = `${shipmentId}/${kind}-photo-${Date.now()}.${photo.name.split('.').pop() || 'jpg'}`;
      const { error: photoUploadError } = await supabase.storage
        .from('shipment-evidence')
        .upload(photoPath, photo);
      if (photoUploadError) throw photoUploadError;
      const { data: photoUrlData } = supabase.storage.from('shipment-evidence').getPublicUrl(photoPath);

      let signatureUrl: string | null = null;
      if (signatureDataUrl) {
        const blob = await dataUrlToBlob(signatureDataUrl);
        const signaturePath = `${shipmentId}/${kind}-signature-${Date.now()}.png`;
        const { error: sigUploadError } = await supabase.storage
          .from('shipment-evidence')
          .upload(signaturePath, blob, { contentType: 'image/png' });
        if (sigUploadError) throw sigUploadError;
        signatureUrl = supabase.storage.from('shipment-evidence').getPublicUrl(signaturePath).data.publicUrl;
      }

      const { error: insertError } = await (supabase as any).from('shipment_evidence').insert({
        shipment_id: shipmentId,
        kind,
        photo_url: photoUrlData.publicUrl,
        signature_url: signatureUrl,
        signer_name: isDelivery ? signerName.trim() : null,
        condition,
        condition_notes: notes.trim() || null,
        lat: position?.coords.latitude ?? null,
        lng: position?.coords.longitude ?? null,
        captured_by: user.id,
      });
      if (insertError) throw insertError;

      toast.success(isDelivery ? 'Delivery confirmed with proof' : 'Pickup confirmed with proof');
      reset();
      onConfirm();
      onOpenChange(false);
    } catch (err) {
      console.error(`Error recording ${kind} evidence:`, err);
      toast.error(`Could not save ${kind} confirmation. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!submitting) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {isDelivery
              ? 'A photo and the recipient\'s signature are required as proof of delivery.'
              : 'A photo of the loaded goods is required as proof of pickup.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="evidence-photo">Photo of goods <span className="text-destructive">*</span></Label>
            <Input
              id="evidence-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              disabled={submitting}
            />
            {photoPreview && (
              <img src={photoPreview} alt="Goods preview" className="mt-2 h-32 w-full rounded-md object-cover border border-border" />
            )}
          </div>

          <div className="space-y-2">
            <Label>Condition</Label>
            <RadioGroup value={condition} onValueChange={(v) => setCondition(v as 'good' | 'damaged')} className="flex gap-4" disabled={submitting}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="good" id="condition-good" />
                <Label htmlFor="condition-good" className="flex items-center gap-1 font-normal cursor-pointer">
                  <CheckCircle className="h-3.5 w-3.5 text-success" /> Good
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="damaged" id="condition-damaged" />
                <Label htmlFor="condition-damaged" className="flex items-center gap-1 font-normal cursor-pointer">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Damaged
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence-notes">Notes (optional)</Label>
            <Textarea
              id="evidence-notes"
              rows={2}
              placeholder={condition === 'damaged' ? 'Describe the damage...' : 'Any additional notes...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />
          </div>

          {isDelivery && (
            <>
              <div className="space-y-2">
                <Label htmlFor="signer-name">Recipient's name <span className="text-destructive">*</span></Label>
                <Input
                  id="signer-name"
                  placeholder="Full name of person receiving goods"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Recipient's signature <span className="text-destructive">*</span></Label>
                <SignaturePad ref={signatureRef} />
              </div>
            </>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            Your location will be recorded with this confirmation, if available.
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            {title}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
