import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type InsuranceStatus = 'not_provided' | 'provided' | 'verified';

interface InsuranceBadgeProps {
  status: InsuranceStatus;
  coverageLimitEur?: number;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig = {
  not_provided: {
    label: 'No Insurance',
    icon: ShieldAlert,
    className: 'text-muted-foreground border-muted-foreground/30',
    tooltip: 'This carrier has not provided insurance information',
  },
  provided: {
    label: 'Insurance Provided',
    icon: ShieldCheck,
    className: 'text-primary border-primary/30 bg-primary/10',
    tooltip: 'This carrier has provided insurance details',
  },
  verified: {
    label: 'Insurance Verified',
    icon: ShieldCheck,
    className: 'text-success border-success/30 bg-success/10',
    tooltip: 'This carrier\'s insurance has been verified',
  },
};

export function InsuranceBadge({ status, coverageLimitEur, showTooltip = true, size = 'md' }: InsuranceBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const badge = (
    <Badge
      variant="outline"
      className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''} gap-1`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {config.label}
      {coverageLimitEur && status !== 'not_provided' && (
        <span className="ml-1 opacity-75">
          (up to €{coverageLimitEur.toLocaleString()})
        </span>
      )}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
