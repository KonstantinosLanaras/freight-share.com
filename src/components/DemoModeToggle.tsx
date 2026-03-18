import { FlaskConical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useDemoMode } from '@/hooks/useDemoMode';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleDemoMode}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
            isDemoMode
              ? 'bg-warning/15 text-warning border border-warning/30'
              : 'bg-muted text-muted-foreground border border-border hover:border-warning/30'
          }`}
        >
          <FlaskConical className="h-3 w-3" />
          <span className="hidden sm:inline">Demo</span>
          <Switch
            checked={isDemoMode}
            onCheckedChange={toggleDemoMode}
            className="scale-75 -my-1"
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isDemoMode ? 'Exit demo mode' : 'Enter demo mode — simulate the full flow'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
