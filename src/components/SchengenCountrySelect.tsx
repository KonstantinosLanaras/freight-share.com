import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SCHENGEN_COUNTRIES } from '@/lib/schengenCountries';

interface SchengenCountrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SchengenCountrySelect({
  value,
  onValueChange,
  placeholder = 'Select country',
  disabled = false,
  className,
}: SchengenCountrySelectProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => SCHENGEN_COUNTRIES.find(c => c.name === value),
    [value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <span>{selected.flag}</span>
              <span>{selected.name}</span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No Schengen country found.</CommandEmpty>
            <CommandGroup>
              {SCHENGEN_COUNTRIES.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onValueChange(country.name);
                    setOpen(false);
                  }}
                >
                  <span className="mr-2">{country.flag}</span>
                  {country.name}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === country.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
