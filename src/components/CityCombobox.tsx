import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { countryCodeToFlag } from '@/lib/countryCodes';

export interface CityOption {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

interface CityComboboxProps {
  value: string;
  countryCode?: string;
  onSelect: (city: CityOption) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CityCombobox({
  value,
  countryCode,
  onSelect,
  placeholder = 'Search city...',
  disabled = false,
  className,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.trim();
      const { data } = await supabase
        .from('cities')
        .select('id, name, country, lat, lng')
        .or(`name.ilike.%${q}%,ascii_name.ilike.%${q}%,alt_names.ilike.%${q}%`)
        .order('population', { ascending: false })
        .limit(20);
      setOptions(data ?? []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const label = useMemo(() => value || placeholder, [value, placeholder]);

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
          <span className="flex items-center gap-2 truncate">
            {countryCode && <span>{countryCodeToFlag(countryCode)}</span>}
            <span className="truncate">{label}</span>
          </span>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Type a city name..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Searching...' : query.trim().length < 2 ? 'Type at least 2 characters' : 'No city found'}
            </CommandEmpty>
            <CommandGroup>
              {options.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.id}
                  onSelect={() => {
                    onSelect(city);
                    setOpen(false);
                  }}
                >
                  <span className="mr-2">{countryCodeToFlag(city.country)}</span>
                  <span>{city.name}</span>
                  <span className="ml-1 text-muted-foreground">({city.country})</span>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === city.name ? 'opacity-100' : 'opacity-0'
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
