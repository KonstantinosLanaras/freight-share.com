import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateLdm } from '@/lib/capacityUtils';

export type SpaceType = 'epe' | 'ldm' | 'dimensions';

interface SpaceInputProps {
  spaceType: SpaceType;
  spaceValue: string;
  lengthCm?: string;
  widthCm?: string;
  heightCm?: string;
  onSpaceTypeChange: (type: SpaceType) => void;
  onSpaceValueChange: (value: string) => void;
  onDimensionsChange?: (dimensions: { lengthCm: string; widthCm: string; heightCm: string }) => void;
  disabled?: boolean;
  showDimensions?: boolean;
  label?: string;
}

export function SpaceInput({
  spaceType,
  spaceValue,
  lengthCm = '',
  widthCm = '',
  heightCm = '',
  onSpaceTypeChange,
  onSpaceValueChange,
  onDimensionsChange,
  disabled = false,
  showDimensions = true,
  label = 'How much space does your shipment require?',
}: SpaceInputProps) {
  const [estimatedLdm, setEstimatedLdm] = useState<number | null>(null);

  useEffect(() => {
    if (spaceType === 'dimensions' && lengthCm && widthCm) {
      const ldm = calculateLdm('dimensions', 0, {
        lengthCm: parseFloat(lengthCm) || 0,
        widthCm: parseFloat(widthCm) || 0,
      });
      setEstimatedLdm(ldm);
    } else {
      setEstimatedLdm(null);
    }
  }, [spaceType, lengthCm, widthCm]);

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{label} <span className="text-destructive">*</span></Label>
      
      <RadioGroup
        value={spaceType}
        onValueChange={(value) => onSpaceTypeChange(value as SpaceType)}
        className="grid gap-3"
        disabled={disabled}
      >
        {/* EPE Option */}
        <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${spaceType === 'epe' ? 'border-primary bg-primary/5' : 'border-border'}`}>
          <RadioGroupItem value="epe" id="space-epe" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="space-epe" className="font-medium cursor-pointer">
                Euro Pallet Equivalent (EPE)
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Standard EUR pallet reference (1.2m × 0.8m)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {spaceType === 'epe' && (
              <div className="mt-2">
                <Input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g., 12"
                  value={spaceValue}
                  onChange={(e) => onSpaceValueChange(e.target.value)}
                  disabled={disabled}
                  className="max-w-[150px]"
                />
              </div>
            )}
          </div>
        </div>

        {/* LDM Option */}
        <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${spaceType === 'ldm' ? 'border-primary bg-primary/5' : 'border-border'}`}>
          <RadioGroupItem value="ldm" id="space-ldm" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="space-ldm" className="font-medium cursor-pointer">
                Linear Loading Metres (LDM)
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Length of trailer floor required</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {spaceType === 'ldm' && (
              <div className="mt-2">
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g., 4.8"
                  value={spaceValue}
                  onChange={(e) => onSpaceValueChange(e.target.value)}
                  disabled={disabled}
                  className="max-w-[150px]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Dimensions Option (for shippers only) */}
        {showDimensions && (
          <div className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${spaceType === 'dimensions' ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <RadioGroupItem value="dimensions" id="space-dimensions" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="space-dimensions" className="font-medium cursor-pointer">
                  Dimensions (advanced)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enter cargo dimensions to calculate space</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {spaceType === 'dimensions' && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Length (cm)</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="120"
                        value={lengthCm}
                        onChange={(e) => onDimensionsChange?.({ lengthCm: e.target.value, widthCm, heightCm })}
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Width (cm)</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="80"
                        value={widthCm}
                        onChange={(e) => onDimensionsChange?.({ lengthCm, widthCm: e.target.value, heightCm })}
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Height (cm)</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="150"
                        value={heightCm}
                        onChange={(e) => onDimensionsChange?.({ lengthCm, widthCm, heightCm: e.target.value })}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  {estimatedLdm !== null && estimatedLdm > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Estimated space requirement: <span className="font-medium">{estimatedLdm} LDM</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </RadioGroup>
    </div>
  );
}
