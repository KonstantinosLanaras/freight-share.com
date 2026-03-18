import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, AlertTriangle, FileText, Loader2, Package, ShieldAlert, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface CarrierInsuranceInfo {
  provider_name: string;
  coverage_type: string;
  coverage_limit_eur: number;
  expiration_date: string;
  status: string;
  policy_number?: string | null;
}

interface GoodsConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  cargoType: string;
  price: number;
  carrierInsurance?: CarrierInsuranceInfo;
}

export function GoodsConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  cargoType,
  price,
  carrierInsurance,
}: GoodsConfirmationDialogProps) {
  const [goodsConfirmed, setGoodsConfirmed] = useState(false);
  const [responsibilityConfirmed, setResponsibilityConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [insuranceAcknowledged, setInsuranceAcknowledged] = useState(false);

  const allChecked = goodsConfirmed && responsibilityConfirmed && termsAccepted && insuranceAcknowledged;

  const handleConfirm = () => {
    if (allChecked) {
      onConfirm();
    }
  };

  const isExpired = carrierInsurance
    ? new Date(carrierInsurance.expiration_date) < new Date()
    : false;
  const hasValidInsurance = carrierInsurance && !isExpired;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Confirm & Proceed to Payment
          </DialogTitle>
          <DialogDescription>
            Review the shipment details, insurance coverage, and confirm before payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
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

          {/* ── Insurance Awareness Section ── */}
          <div className={`p-4 rounded-lg border ${hasValidInsurance ? 'border-primary/20 bg-primary/5' : 'border-warning/30 bg-warning/5'}`}>
            <div className="flex items-start gap-3">
              {hasValidInsurance ? (
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-warning mt-0.5 shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Carrier Liability Coverage</h4>
                {hasValidInsurance ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      This carrier has liability coverage up to{' '}
                      <span className="font-semibold text-foreground">
                        €{carrierInsurance!.coverage_limit_eur.toLocaleString()}
                      </span>{' '}
                      ({carrierInsurance!.coverage_type}) via {carrierInsurance!.provider_name}.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Valid until {format(new Date(carrierInsurance!.expiration_date), 'MMM d, yyyy')}.
                      {carrierInsurance!.status === 'verified' && (
                        <Badge variant="outline" className="ml-2 text-xs text-primary border-primary/30">Verified</Badge>
                      )}
                    </p>
                  </>
                ) : isExpired ? (
                  <p className="text-sm text-warning">
                    This carrier's insurance has expired. Carrier liability is limited by law. You should consider arranging your own cargo insurance.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No carrier insurance information has been provided. Carrier liability is limited by law (typically ~8.33 SDR/kg under CMR).
                  </p>
                )}

                <div className="flex items-start gap-2 p-2.5 rounded bg-muted/50 border border-border mt-2">
                  <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Carrier liability is fault-based and capped. If your cargo value exceeds the carrier's coverage limit, consider arranging additional cargo insurance independently.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmations */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="goods-confirm"
                checked={goodsConfirmed}
                onCheckedChange={(checked) => setGoodsConfirmed(checked === true)}
              />
              <Label htmlFor="goods-confirm" className="text-sm leading-relaxed cursor-pointer">
                I confirm that the declared cargo type (<span className="font-medium capitalize">{cargoType}</span>) accurately represents the goods being shipped.
              </Label>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <Checkbox
                id="insurance-acknowledge"
                checked={insuranceAcknowledged}
                onCheckedChange={(checked) => setInsuranceAcknowledged(checked === true)}
              />
              <Label htmlFor="insurance-acknowledge" className="text-sm leading-relaxed cursor-pointer">
                <span className="flex items-center gap-1 mb-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-warning" />
                  <span className="font-medium">Insurance Acknowledgement</span>
                </span>
                I understand that carrier liability is limited and fault-based. I am responsible for arranging any additional cargo insurance for my goods.
                {!hasValidInsurance && (
                  <span className="block text-warning text-xs mt-1">
                    This carrier has not provided valid insurance. Proceeding means you accept full risk beyond legal carrier liability limits.
                  </span>
                )}
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
                I understand that FreightShare acts as a technical facilitator only. The transport contract is between me and the carrier.
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
