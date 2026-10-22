import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck, AlertTriangle, FileText, Loader2, Package,
  Info, Euro, Shield, ChevronDown, ChevronUp, FlaskConical, Paperclip
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CMR_LIABILITY_EUR_PER_KG } from '@/lib/insuranceUtils';

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
  onConfirm: (insuranceDecision: InsuranceDecision) => void;
  isLoading: boolean;
  cargoType: string;
  price: number;
  weightKg: number;
  carrierInsurance?: CarrierInsuranceInfo;
  isDemoMode?: boolean;
}

export interface InsuranceDecision {
  declaredCargoValue: number | null;
}

export function GoodsConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  cargoType,
  price,
  weightKg,
  carrierInsurance,
  isDemoMode = false,
}: GoodsConfirmationDialogProps) {
  const [goodsConfirmed, setGoodsConfirmed] = useState(false);
  const [responsibilityConfirmed, setResponsibilityConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [declaredCargoValue, setDeclaredCargoValue] = useState('');
  const [showCoverageDetails, setShowCoverageDetails] = useState(false);

  const isExpired = carrierInsurance
    ? new Date(carrierInsurance.expiration_date) < new Date()
    : false;
  const hasValidInsurance = carrierInsurance && !isExpired;

  const coverageInfo = useMemo(() => {
    const cargoValue = parseFloat(declaredCargoValue);
    if (!cargoValue || cargoValue <= 0) return null;
    const cmrCap = weightKg * CMR_LIABILITY_EUR_PER_KG;
    const carrierLiabilityEstimate = hasValidInsurance
      ? Math.min(carrierInsurance!.coverage_limit_eur, cmrCap)
      : cmrCap;
    const coverageGap = Math.max(0, cargoValue - carrierLiabilityEstimate);
    return { carrierLiabilityEstimate, coverageGap };
  }, [declaredCargoValue, weightKg, hasValidInsurance, carrierInsurance]);

  const gapPercent = coverageInfo && parseFloat(declaredCargoValue) > 0
    ? Math.round((coverageInfo.carrierLiabilityEstimate / parseFloat(declaredCargoValue)) * 100)
    : 0;

  const allChecked = goodsConfirmed && responsibilityConfirmed && termsAccepted;

  const handleConfirm = () => {
    if (!allChecked) return;
    onConfirm({ declaredCargoValue: parseFloat(declaredCargoValue) || null });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Confirm & Proceed to Payment
          </DialogTitle>
          <DialogDescription>
            Review details and accept terms before payment.
          </DialogDescription>
        </DialogHeader>

        {isDemoMode && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs">
            <FlaskConical className="h-3.5 w-3.5 text-warning shrink-0" />
            <span className="text-warning-foreground">
              <strong>Beta</strong> — Payment will be simulated.
            </span>
          </div>
        )}

        <div className="space-y-5 py-4">
          {/* Transaction Summary */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cargo Type</span>
              </div>
              <Badge variant="outline" className="capitalize">{cargoType}</Badge>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium">Transport Cost</span>
              <span className="text-lg font-bold text-foreground">€{price}</span>
            </div>
          </div>

          {/* CMR Liability Information */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/40 px-4 py-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Carrier Liability</h3>
              <Badge variant="outline" className="ml-auto text-xs">Informational</Badge>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cargo-value" className="text-sm font-medium">
                  What is the total value of your cargo? <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cargo-value"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="e.g. 15000"
                    className="pl-10"
                    value={declaredCargoValue}
                    onChange={(e) => setDeclaredCargoValue(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Helps you understand how much of your cargo is covered by carrier CMR liability.
                </p>
              </div>

              {coverageInfo && parseFloat(declaredCargoValue) > 0 && (
                <div className="space-y-3">
                  {/* Coverage bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Carrier liability</span>
                      <span>Your cargo value</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-destructive/15 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary/70 transition-all duration-500"
                        style={{ width: `${Math.min(100, gapPercent)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-primary">
                        €{coverageInfo.carrierLiabilityEstimate.toLocaleString()} carrier liability
                      </span>
                      {coverageInfo.coverageGap > 0 && (
                        <span className="font-medium text-destructive">
                          €{coverageInfo.coverageGap.toLocaleString()} above carrier limit
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCoverageDetails(!showCoverageDetails)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Info className="h-3 w-3" />
                    How is carrier liability calculated?
                    {showCoverageDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {showCoverageDetails && (
                    <div className="text-xs text-muted-foreground p-3 rounded bg-muted/50 border border-border space-y-1">
                      <p>
                        Under the CMR Convention, carrier liability is capped at ~€{CMR_LIABILITY_EUR_PER_KG}/kg
                        ({weightKg} kg = €{(weightKg * CMR_LIABILITY_EUR_PER_KG).toLocaleString()}).
                      </p>
                      {hasValidInsurance && (
                        <p>
                          This carrier's transport insurance covers up to €{carrierInsurance!.coverage_limit_eur.toLocaleString()}
                          {' '}via {carrierInsurance!.provider_name}
                          {carrierInsurance!.status === 'verified' && ' (verified)'}.
                        </p>
                      )}
                      <p>Carrier liability is <strong>fault-based</strong> — it only applies if the carrier caused the loss or damage.</p>
                    </div>
                  )}

                  {/* Gap advisory */}
                  {coverageInfo.coverageGap > 0 ? (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <Paperclip className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">
                          €{coverageInfo.coverageGap.toLocaleString()} of your cargo value exceeds carrier liability.
                        </p>
                        <p>
                          If this amount matters to you, arrange your own cargo insurance with a licensed insurer before shipping.
                          You can attach your policy document directly to this shipment after booking.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Your declared cargo value is within the carrier's liability limit.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(!declaredCargoValue || parseFloat(declaredCargoValue) <= 0) && (
                <div className="flex items-start gap-2 p-2.5 rounded bg-muted/50 border border-border">
                  <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Enter your cargo value above to see how it compares to carrier CMR liability.
                    You can also attach your cargo insurance document to the shipment after booking.
                  </p>
                </div>
              )}
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
            ) : isDemoMode ? (
              <>
                <FlaskConical className="h-4 w-4 mr-2" />
                Simulate Payment · €{price.toLocaleString()}
              </>
            ) : (
              <>
                Proceed to Payment · €{price.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
