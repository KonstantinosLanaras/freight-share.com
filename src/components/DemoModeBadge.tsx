import { FlaskConical } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';

export function DemoModeBadge() {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-warning/90 text-warning-foreground text-center py-1.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 backdrop-blur-sm">
      <FlaskConical className="h-3.5 w-3.5" />
      <span>Demo Mode — All actions are simulated. No real transactions.</span>
    </div>
  );
}
