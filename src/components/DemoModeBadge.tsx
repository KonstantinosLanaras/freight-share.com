import { FlaskConical } from 'lucide-react';

export function DemoModeBadge() {
  // Permanent banner — platform is always in beta.
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-warning text-warning-foreground text-center py-1 px-4 text-[11px] font-semibold flex items-center justify-center gap-1.5 border-b border-warning-foreground/20 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      <FlaskConical className="h-3 w-3" />
      <span>Beta — All actions are simulated. No real transactions.</span>
    </div>
  );
}
