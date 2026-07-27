import { useState, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FlaskConical } from 'lucide-react';

interface BypassState {
  open: boolean;
  reasons: string[];
  onConfirm: (() => void) | null;
}

/**
 * Shared confirmation pop-up for compliance gates bypassed during beta
 * (see complianceGating.ts) -- replaces the earlier toast-only notice
 * with an explicit "Beta exception" the user has to acknowledge before
 * the action proceeds, rather than something that flashes by passively.
 */
export function useBetaBypassConfirm() {
  const [state, setState] = useState<BypassState>({ open: false, reasons: [], onConfirm: null });

  const confirmBypass = useCallback((reasons: string[], onConfirm: () => void) => {
    setState({ open: true, reasons, onConfirm });
  }, []);

  const close = () => setState((s) => ({ ...s, open: false }));

  const dialog = (
    <Dialog open={state.open} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-warning" />
            Beta exception
          </DialogTitle>
          <DialogDescription>
            On the live platform, this would normally be required before you could proceed:
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm">
          {state.reasons.map((reason) => (
            <li key={reason} className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-foreground">
              {reason}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Allowed here only so you can try the full flow during beta testing. This exception won't exist once the platform goes live.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button
            onClick={() => {
              const confirm = state.onConfirm;
              close();
              confirm?.();
            }}
          >
            Continue anyway (beta only)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirmBypass, dialog };
}
