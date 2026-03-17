import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, AlertTriangle, FileText, Loader2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GoodsConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  cargoType: string;
  price: number;
}

export function GoodsConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  cargoType,
  price,
}: GoodsConfirmationDialogProps) {
  const [goodsConfirmed, setGoodsConfirmed] = useState(false);
  const [responsibilityConfirmed, setResponsibilityConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const allChecked = goodsConfirmed && responsibilityConfirmed && termsAccepted;

  const handleConfirm = () => {
    if (allChecked) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Goods & Responsibility Confirmation
          </DialogTitle>
          <DialogDescription>
            Please review and confirm the following before proceeding to payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cargo Type</span>
              </div>
              <Badge variant="outline" className="capitalize">{cargoType}</Badge>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium">Payment Amount</span>
              <span className="text-lg font-bold text-foreground">€{price}</span>
            </div>
          </div>

          {/* Confirmations */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="goods-confirm"
                checked={goodsConfirmed}
                onCheckedChange={(checked) => setGoodsConfirmed(checked === true)}
              />
              <Label htmlFor="goods-confirm" className="text-sm leading-relaxed cursor-pointer">
                I confirm that the declared cargo type (<span className="font-medium capitalize">{cargoType}</span>) accurately represents the goods being shipped. Misrepresentation may void platform protections.
              </Label>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="responsibility-confirm"
                checked={responsibilityConfirmed}
                onCheckedChange={(checked) => setResponsibilityConfirmed(checked === true)}
              />
              <Label htmlFor="responsibility-confirm" className="text-sm leading-relaxed cursor-pointer">
                <span className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  <span className="font-medium">Responsibility Acknowledgement</span>
                </span>
                I understand that ReRoute acts as a technical facilitator only. I am responsible for the accuracy of the shipment description and any insurance arrangements for my goods.
              </Label>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="terms-accept"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label htmlFor="terms-accept" className="text-sm leading-relaxed cursor-pointer">
                <span className="flex items-center gap-1 mb-1">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">Terms of Service</span>
                </span>
                I have read and agree to the{' '}
                <Link to="/terms" target="_blank" className="text-primary underline hover:no-underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/payments" target="_blank" className="text-primary underline hover:no-underline">
                  Payment Terms
                </Link>.
              </Label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!allChecked || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
