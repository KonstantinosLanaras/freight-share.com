import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { checkCompatibility, type CargoType, type VehicleType, vehicleTypeLabels, cargoTypeLabels } from '@/lib/cargoVehicleCompatibility';
import { checkLoadRouteMatch, type LoadMatchingCriteria, type RouteMatchingCriteria } from '@/lib/matchingUtils';

interface CompatibilityBadgeProps {
  cargoType: CargoType;
  vehicleType: VehicleType | null;
  showLabel?: boolean;
  size?: 'sm' | 'default';
}

export function CompatibilityBadge({ 
  cargoType, 
  vehicleType, 
  showLabel = true,
  size = 'default' 
}: CompatibilityBadgeProps) {
  if (!vehicleType) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="text-muted-foreground border-muted">
              <HelpCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
              {showLabel && <span className="ml-1">Unknown</span>}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            Vehicle type not specified
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const result = checkCompatibility(cargoType, vehicleType);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="outline" 
            className={result.compatible 
              ? 'text-success border-success/50 bg-success/10' 
              : 'text-destructive border-destructive/50 bg-destructive/10'
            }
          >
            {result.compatible ? (
              <CheckCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
            ) : (
              <XCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
            )}
            {showLabel && (
              <span className="ml-1">
                {result.compatible ? 'Compatible' : 'Incompatible'}
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <div className="font-medium mb-1">
              {cargoTypeLabels[cargoType]} cargo + {vehicleTypeLabels[vehicleType]}
            </div>
            <div className="text-xs">
              {result.compatible 
                ? result.note || 'This cargo type can be carried by this vehicle'
                : result.note || 'This cargo type cannot be carried by this vehicle type'
              }
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface FullMatchBadgeProps {
  load: LoadMatchingCriteria;
  route: RouteMatchingCriteria;
  showDetails?: boolean;
}

export function FullMatchBadge({ load, route, showDetails = false }: FullMatchBadgeProps) {
  const result = checkLoadRouteMatch(load, route);

  const getBadgeStyle = () => {
    if (result.isMatch) {
      return 'text-success border-success/50 bg-success/10';
    }
    if (!result.isCompatible) {
      return 'text-destructive border-destructive/50 bg-destructive/10';
    }
    return 'text-warning border-warning/50 bg-warning/10';
  };

  const getIcon = () => {
    if (result.isMatch) return <CheckCircle className="h-4 w-4" />;
    if (!result.isCompatible) return <XCircle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (result.isMatch) return 'Eligible';
    if (!result.isCompatible) return 'Incompatible';
    return 'Insufficient';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={getBadgeStyle()}>
            {getIcon()}
            <span className="ml-1">{getLabel()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs space-y-1">
            {result.isMatch ? (
              <div className="text-success font-medium">✓ This route can carry this load</div>
            ) : (
              <>
                <div className="font-medium text-destructive">Cannot match this load:</div>
                <ul className="text-xs space-y-1">
                  {result.reasons.map((reason, i) => (
                    <li key={i}>• {reason}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
