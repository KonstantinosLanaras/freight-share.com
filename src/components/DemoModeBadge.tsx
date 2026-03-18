import { FlaskConical } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';

export function DemoModeBadge() {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-warning text-warning-foreground text-center py-1 px-4 text-[11px] font-semibold flex items-center justify-center gap-1.5">
      <FlaskConical className="h-3 w-3" />
      <span>Demo Mode — All actions are simulated. No real transactions.</span>
    </div>
  );
}
