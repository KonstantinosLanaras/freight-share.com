import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck, AlertTriangle, FileText, Loader2, Package,
  ShieldAlert, Info, Euro, Shield, ChevronDown, ChevronUp, FlaskConical
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  addInsurance: boolean;
  declaredCargoValue: number | null;
  estimatedPremium: number | null;
  carrierLiabilityEstimate: number | null;
  coverageGap: number | null;
}

// CMR liability: ~8.33 SDR/kg ≈ €10/kg (simplified for MVP)
const CMR_LIABILITY_EUR_PER_KG = 10;
// Flat premium rate for MVP
const INSURANCE_PREMIUM_RATE = 0.015; // 1.5% of declared cargo value
const MIN_PREMIUM = 25; // Minimum premium €25

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

  // Insurance product state
  const [declaredCargoValue, setDeclaredCargoValue] = useState('');
  const [addInsurance, setAddInsurance] = useState<boolean | null>(null);
  const [showCoverageDetails, setShowCoverageDetails] = useState(false);

  const isExpired = carrierInsurance
    ? new Date(carrierInsurance.expiration_date) < new Date()
    : false;
  const hasValidInsurance = carrierInsurance && !isExpired;

  // Calculate coverage gap and premium
  const insuranceCalc = useMemo(() => {
    const cargoValue = parseFloat(declaredCargoValue);
    if (!cargoValue || cargoValue <= 0) return null;

    const carrierLiabilityEstimate = hasValidInsurance
      ? Math.min(carrierInsurance!.coverage_limit_eur, weightKg * CMR_LIABILITY_EUR_PER_KG)
      : weightKg * CMR_LIABILITY_EUR_PER_KG;

    const coverageGap = Math.max(0, cargoValue - carrierLiabilityEstimate);
    const estimatedPremium = coverageGap > 0
      ? Math.max(MIN_PREMIUM, Math.round(cargoValue * INSURANCE_PREMIUM_RATE * 100) / 100)
      : 0;

    return { carrierLiabilityEstimate, coverageGap, estimatedPremium };
  }, [declaredCargoValue, weightKg, hasValidInsurance, carrierInsurance]);

  const hasGap = insuranceCalc && insuranceCalc.coverageGap > 0;
  const insuranceDecisionMade = addInsurance !== null || !hasGap;

  const allChecked = goodsConfirmed && responsibilityConfirmed && termsAccepted && insuranceDecisionMade;

  const handleConfirm = () => {
    if (!allChecked) return;
    const cargoValue = parseFloat(declaredCargoValue) || null;
    onConfirm({
      addInsurance: addInsurance === true,
      declaredCargoValue: cargoValue,
      estimatedPremium: addInsurance && insuranceCalc ? insuranceCalc.estimatedPremium : null,
      carrierLiabilityEstimate: insuranceCalc?.carrierLiabilityEstimate ?? null,
      coverageGap: insuranceCalc?.coverageGap ?? null,
    });
  };

  const gapPercent = insuranceCalc && parseFloat(declaredCargoValue) > 0
    ? Math.round((insuranceCalc.carrierLiabilityEstimate / parseFloat(declaredCargoValue)) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Confirm & Proceed to Payment
          </DialogTitle>
          <DialogDescription>
            Review details, select protection, and accept terms before payment.
          </DialogDescription>
        </DialogHeader>

        {isDemoMode && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs">
            <FlaskConical className="h-3.5 w-3.5 text-warning shrink-0" />
            <span className="text-warning-foreground">
              <strong>Demo Mode</strong> — Payment will be simulated. Insurance selection is fully functional for demonstration.
            </span>
          </div>
        )}

        <div className="space-y-5 py-4">
          {/* ── Transaction Summary ── */}
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

          {/* ── INSURANCE PRODUCT SECTION ── */}
          <div className="rounded-lg border-2 border-primary/20 overflow-hidden">
            {/* Header */}
            <div className="bg-primary/5 px-4 py-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Cargo Protection</h3>
              <Badge variant="outline" className="ml-auto text-xs border-primary/30 text-primary">Optional</Badge>
            </div>

            <div className="p-4 space-y-4">
              {/* Step 1: Declared cargo value */}
              <div className="space-y-2">
                <Label htmlFor="cargo-value" className="text-sm font-medium">
                  What is the total value of your cargo?
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
                    onChange={(e) => {
                      setDeclaredCargoValue(e.target.value);
                      setAddInsurance(null);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used to calculate your coverage gap — not shared with the carrier.
                </p>
              </div>

              {/* Step 2: Coverage gap visualisation */}
              {insuranceCalc && parseFloat(declaredCargoValue) > 0 && (
                <div className="space-y-3">
                  {/* Visual gap bar */}
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
                        €{insuranceCalc.carrierLiabilityEstimate.toLocaleString()} covered
                      </span>
                      {insuranceCalc.coverageGap > 0 && (
                        <span className="font-medium text-destructive">
                          €{insuranceCalc.coverageGap.toLocaleString()} uncovered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expandable detail */}
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
                        Under CMR convention, carrier liability is capped at ~€{CMR_LIABILITY_EUR_PER_KG}/kg
                        ({weightKg} kg = €{(weightKg * CMR_LIABILITY_EUR_PER_KG).toLocaleString()}).
                      </p>
                      {hasValidInsurance && (
                        <p>
                          This carrier's insurance covers up to €{carrierInsurance!.coverage_limit_eur.toLocaleString()}
                          {' '}via {carrierInsurance!.provider_name}
                          {carrierInsurance!.status === 'verified' && ' (verified)'}.
                        </p>
                      )}
                      <p>Carrier liability is <strong>fault-based</strong> — it only applies if the carrier is at fault for loss or damage.</p>
                    </div>
                  )}

                  {/* Step 3: Insurance decision */}
                  {hasGap ? (
                    <div className="space-y-2">
                      {/* Add Insurance option */}
                      <button
                        type="button"
                        onClick={() => setAddInsurance(true)}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          addInsurance === true
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            addInsurance === true ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`}>
                            {addInsurance === true && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-foreground">Add Cargo Protection</span>
                              <span className="text-sm font-bold text-primary">
                                + €{insuranceCalc.estimatedPremium.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              All-risk coverage up to €{parseFloat(declaredCargoValue).toLocaleString()} declared value. Covers loss, damage, and extraordinary events.
                            </p>
                            {isDemoMode && (
                              <p className="text-xs text-warning mt-1">
                                Demo: No real underwriting — selection recorded for demonstration.
                              </p>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Decline option */}
                      <button
                        type="button"
                        onClick={() => setAddInsurance(false)}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          addInsurance === false
                            ? 'border-border bg-muted/30'
                            : 'border-border hover:border-muted-foreground/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            addInsurance === false ? 'border-foreground bg-foreground' : 'border-muted-foreground'
                          }`}>
                            {addInsurance === false && (
                              <div className="w-1.5 h-1.5 rounded-full bg-background" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground">Continue without protection</span>
                            <p className="text-xs text-muted-foreground mt-1">
                              You accept the risk for the uncovered €{insuranceCalc.coverageGap.toLocaleString()}.
                              Carrier liability is limited and fault-based.
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Declined warning */}
                      {addInsurance === false && (
                        <div className="flex items-start gap-2 p-2.5 rounded bg-destructive/5 border border-destructive/20">
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                          <p className="text-xs text-destructive/80">
                            If your cargo is lost or damaged beyond carrier fault, you will bear the full cost of the uncovered amount.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* No gap — cargo value within carrier liability */
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Your declared cargo value is within the carrier's liability limit. Additional insurance is not needed for this shipment.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* No value entered yet */}
              {(!declaredCargoValue || parseFloat(declaredCargoValue) <= 0) && (
                <div className="flex items-start gap-2 p-2.5 rounded bg-muted/50 border border-border">
                  <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Enter your cargo value to see if you need additional protection.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Updated total if insurance selected ── */}
          {addInsurance && insuranceCalc && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Transport cost</span>
                  <span>€{price}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Cargo protection premium</span>
                  <span>€{insuranceCalc.estimatedPremium.toLocaleString()}</span>
                </div>
                <div className="border-t border-primary/20 pt-1.5 flex justify-between font-bold text-foreground">
                  <span>Total</span>
                  <span>€{(price + insuranceCalc.estimatedPremium).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Confirmations ── */}
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
                Simulate Payment
                {addInsurance && insuranceCalc && (
                  <span className="ml-1">· €{(price + insuranceCalc.estimatedPremium).toLocaleString()}</span>
                )}
              </>
            ) : (
              <>
                Proceed to Payment
                {addInsurance && insuranceCalc && (
                  <span className="ml-1">· €{(price + insuranceCalc.estimatedPremium).toLocaleString()}</span>
                )}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
