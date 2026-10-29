import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { BarChart2, Loader2, TrendingUp, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface Props {
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  /** When provided, the suggestion is scaled to this pallet count */
  pallets?: number;
  /** 'load' = shipper posting a load; 'route' = carrier posting a route */
  mode?: 'load' | 'route';
}

interface ComparableLoad {
  id: string;
  origin_city: string;
  destination_city: string;
  pallets: number;
  price: number;
  pickup_date_from: string;
  matchLevel: 1 | 2 | 3;
}

type Level = 1 | 2 | 3;
const levelLabel: Record<Level, string> = {
  1: 'exact route',
  2: 'same countries',
  3: 'nearby lanes',
};

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function MarketPricePanel({
  originCity,
  originCountry,
  destinationCity,
  destinationCountry,
  pallets,
  mode = 'load',
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comparables, setComparables] = useState<ComparableLoad[]>([]);
  const [matchLevel, setMatchLevel] = useState<Level | null>(null);
  const [fetched, setFetched] = useState(false);

  const ready = originCity && originCountry && destinationCity && destinationCountry;

  const fetchComparables = async () => {
    if (fetched) { setOpen(o => !o); return; }
    setOpen(true);
    setLoading(true);

    try {
      // Level 1: exact city pair
      let { data: l1 } = await supabase
        .from('loads')
        .select('id, origin_city, destination_city, pallets, price, pickup_date_from')
        .eq('origin_city', originCity)
        .eq('destination_city', destinationCity)
        .not('price', 'is', null)
        .not('status', 'in', '("draft","cancelled")')
        .order('created_at', { ascending: false })
        .limit(10);

      if (l1 && l1.length >= 2) {
        setComparables(l1.map(r => ({ ...r, matchLevel: 1 as Level })));
        setMatchLevel(1);
        setFetched(true);
        return;
      }

      // Level 2: same country pair
      let { data: l2 } = await supabase
        .from('loads')
        .select('id, origin_city, destination_city, pallets, price, pickup_date_from')
        .eq('origin_country', originCountry)
        .eq('destination_country', destinationCountry)
        .not('price', 'is', null)
        .not('status', 'in', '("draft","cancelled")')
        .order('created_at', { ascending: false })
        .limit(10);

      if (l2 && l2.length >= 2) {
        setComparables(l2.map(r => ({ ...r, matchLevel: 2 as Level })));
        setMatchLevel(2);
        setFetched(true);
        return;
      }

      // Level 3: either country matches
      let { data: l3 } = await supabase
        .from('loads')
        .select('id, origin_city, destination_city, pallets, price, pickup_date_from')
        .or(`origin_country.eq.${originCountry},destination_country.eq.${destinationCountry}`)
        .not('price', 'is', null)
        .not('status', 'in', '("draft","cancelled")')
        .order('created_at', { ascending: false })
        .limit(10);

      setComparables((l3 || []).map(r => ({ ...r, matchLevel: 3 as Level })));
      setMatchLevel((l3 || []).length > 0 ? 3 : null);
    } finally {
      setFetched(true);
      setLoading(false);
    }
  };

  // Compute suggestion
  const pricesPerPallet = comparables
    .filter(c => c.price > 0 && c.pallets > 0)
    .map(c => c.price / c.pallets);
  const medianPPP = median(pricesPerPallet);
  const suggested = pallets && pallets > 0 && medianPPP > 0
    ? Math.round(medianPPP * pallets / 10) * 10
    : null;
  const rangeMin = pricesPerPallet.length ? Math.round(Math.min(...pricesPerPallet)) : null;
  const rangeMax = pricesPerPallet.length ? Math.round(Math.max(...pricesPerPallet)) : null;

  if (!ready) return null;

  return (
    <div className="mt-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2 border-dashed"
        onClick={fetchComparables}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BarChart2 className="h-4 w-4" />
        )}
        Compare market prices
        {!loading && (open ? <ChevronUp className="h-3.5 w-3.5 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto" />)}
      </Button>

      {open && !loading && (
        <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 space-y-4">
          {comparables.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              No comparable loads found yet on this lane. You're setting the market!
            </p>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {comparables.length} load{comparables.length !== 1 ? 's' : ''} based on{' '}
                  <strong>{matchLevel ? levelLabel[matchLevel] : 'nearby lanes'}</strong>
                </span>
                {matchLevel && matchLevel > 1 && (
                  <Badge variant="outline" className="text-xs">
                    Broadened search
                  </Badge>
                )}
              </div>

              {/* Comparables table */}
              <div className="space-y-2">
                {comparables.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0">
                    <div className="text-foreground">
                      {c.origin_city} → {c.destination_city}
                      <span className="text-muted-foreground ml-2 text-xs">
                        {c.pallets} pal · {format(new Date(c.pickup_date_from), 'MMM d')}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground">€{c.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Pricing suggestion */}
              {pricesPerPallet.length >= 2 && (
                <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {suggested != null
                          ? `Suggested price: €${suggested.toLocaleString()}`
                          : `Market rate: €${rangeMin}–€${rangeMax} / pallet`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {suggested != null
                          ? `Median €${Math.round(medianPPP)}/pallet × ${pallets} pallets, rounded to nearest €10.`
                          : `Range across ${pricesPerPallet.length} comparable loads. Enter your pallet count for a specific suggestion.`}
                      </p>
                      {mode === 'route' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          These are prices shippers are posting for cargo on this lane — use them as a guide when quoting.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
