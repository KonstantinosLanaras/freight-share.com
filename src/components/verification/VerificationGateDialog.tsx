import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ShieldCheck, Clock, ArrowRight, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VerificationGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verificationStatus: string | null;
  role: 'shipper' | 'carrier' | null;
  returnPath: string;
}

export function VerificationGateDialog({
  open,
  onOpenChange,
  verificationStatus,
  role,
  returnPath,
}: VerificationGateDialogProps) {
  const navigate = useNavigate();

  const isPending = verificationStatus === 'pending';
  const isRejected = verificationStatus === 'rejected';

  const verifyPath = role === 'carrier'
    ? `/dashboard/carrier/insurance`
    : `/dashboard/shipper/verify?returnTo=${encodeURIComponent(returnPath)}`;

  const handleVerify = () => {
    onOpenChange(false);
    navigate(verifyPath);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPending ? (
              <Clock className="h-5 w-5 text-warning" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-destructive" />
            )}
            {isPending ? 'Verification in progress' : 'Business verification required'}
          </DialogTitle>
          <DialogDescription>
            {isPending
              ? 'Your verification is being reviewed. You\'ll be able to transact once approved.'
              : 'To make offers and transact on FreightShare, your business must be verified.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status indicator */}
          <div className={`p-4 rounded-lg border ${
            isPending
              ? 'bg-warning/5 border-warning/20'
              : isRejected
                ? 'bg-destructive/5 border-destructive/20'
                : 'bg-muted/50 border-border'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isPending
                  ? 'bg-warning/10'
                  : isRejected
                    ? 'bg-destructive/10'
                    : 'bg-muted'
              }`}>
                {isPending ? (
                  <Clock className="h-5 w-5 text-warning" />
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="font-medium text-foreground text-sm">
                  {isPending
                    ? 'Under review'
                    : isRejected
                      ? 'Verification needs updating'
                      : 'Not yet verified'}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isPending
                    ? 'This usually takes 1–2 business days.'
                    : isRejected
                      ? 'Please update your company details and resubmit.'
                      : 'Complete your company information to unlock transactions.'}
                </p>
              </div>
            </div>
          </div>

          {/* Why verification matters */}
          {!isPending && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Why is this required?</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>Protects both parties in every transaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>Required for payment processing and legal compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>Builds trust and visibility on the marketplace</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!isPending && (
            <Button onClick={handleVerify}>
              {isRejected ? 'Update details' : 'Verify my business'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
