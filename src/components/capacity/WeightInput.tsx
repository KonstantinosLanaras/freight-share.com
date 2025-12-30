import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WeightInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function WeightInput({
  value,
  onChange,
  disabled = false,
  label = 'Total weight (kg)',
  placeholder = 'e.g., 12000',
  required = true,
}: WeightInputProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Label htmlFor="weight">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Total weight of the shipment in kilograms</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        id="weight"
        type="number"
        min="1"
        step="1"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1"
        required={required}
      />
    </div>
  );
}
