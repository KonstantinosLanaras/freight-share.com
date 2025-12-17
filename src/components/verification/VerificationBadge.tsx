import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Clock, ShieldAlert, ShieldX } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

interface VerificationBadgeProps {
  status: VerificationStatus;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig = {
  unverified: {
    label: 'Unverified',
    icon: ShieldAlert,
    variant: 'outline' as const,
    className: 'text-muted-foreground border-muted-foreground/30',
    tooltip: 'This business has not yet completed verification',
  },
  pending: {
    label: 'Verification Pending',
    icon: Clock,
    variant: 'outline' as const,
    className: 'text-warning border-warning/30 bg-warning/10',
    tooltip: 'Verification documents are under review',
  },
  verified: {
    label: 'Business Verified',
    icon: ShieldCheck,
    variant: 'outline' as const,
    className: 'text-success border-success/30 bg-success/10',
    tooltip: 'This business has been verified — protects both parties in transactions',
  },
  rejected: {
    label: 'Verification Rejected',
    icon: ShieldX,
    variant: 'destructive' as const,
    className: '',
    tooltip: 'Verification was rejected — please resubmit documents',
  },
};

export function VerificationBadge({ status, showTooltip = true, size = 'md' }: VerificationBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const badge = (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''} gap-1`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {config.label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}