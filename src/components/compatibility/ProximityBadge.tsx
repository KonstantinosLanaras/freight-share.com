import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MapPin } from 'lucide-react';
import type { ProximityTier } from '@/lib/geoUtils';

interface ProximityBadgeProps {
  distanceKm: number;
  tier: ProximityTier;
  label?: string;
}

export function ProximityBadge({ distanceKm, tier, label }: ProximityBadgeProps) {
  if (!tier) return null;

  const style = tier === 'green'
    ? 'text-success border-success/50 bg-success/10'
    : 'text-warning border-warning/50 bg-warning/10';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={style}>
            <MapPin className="h-3 w-3" />
            <span className="ml-1">{distanceKm.toFixed(0)} km</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs text-xs">
            {label || `${distanceKm.toFixed(1)} km away`}
            {tier === 'green' ? ' — very close match' : ' — within acceptable range'}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
