import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  Loader2,
  MapPin,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { supabase } from '@/integrations/supabase/client';
import { BookmarkButton } from '@/components/BookmarkButton';
import { getBookmarks, BOOKMARKS_STORAGE_KEY } from '@/lib/bookmarks';

interface SavedLoad {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  pallets: number;
  price: number | null;
  pricing_type?: string;
  pickup_date_from: string;
  pickup_date_to: string;
  isDemo?: boolean;
}

const DEMO_SAVED_LOADS: SavedLoad[] = [
  {
    id: 'demo-saved-1',
    origin_city: 'Milan',
    origin_country: 'IT',
    destination_city: 'Munich',
    destination_country: 'DE',
    pallets: 6,
    price: 720,
    pricing_type: 'fixed',
    pickup_date_from: '2026-04-24',
    pickup_date_to: '2026-04-26',
    isDemo: true,
  },
  {
    id: 'demo-saved-2',
    origin_city: 'Rotterdam',
    origin_country: 'NL',
    destination_city: 'Lyon',
    destination_country: 'FR',
    pallets: 12,
    price: 1340,
    pricing_type: 'fixed',
    pickup_date_from: '2026-04-28',
    pickup_date_to: '2026-04-28',
    isDemo: true,
  },
];

const formatDateRange = (from: string, to: string) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (from === to) return format(fromDate, 'MMM d, yyyy');
  return `${format(fromDate, 'MMM d')} - ${format(toDate, 'd, yyyy')}`;
};

export default function SavedLoads() {
  const { role } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [loading, setLoading] = useState(true);
  const [loads, setLoads] = useState<SavedLoad[]>([]);

  const dashboardPath = role === 'carrier' ? '/dashboard/carrier' : '/dashboard/shipper';
  const browsePath = role === 'carrier' ? '/dashboard/carrier/find-loads' : '/routes';

  const loadSaved = async () => {
    setLoading(true);
    const ids = getBookmarks().filter((id) => !id.startsWith('demo-'));
    let real: SavedLoad[] = [];
    if (ids.length > 0) {
      const { data } = await supabase
        .from('loads')
        .select(
          'id, origin_city, origin_country, destination_city, destination_country, pallets, price, pricing_type, pickup_date_from, pickup_date_to'
        )
        .in('id', ids);
      real = (data as SavedLoad[]) || [];
    }
    // In demo mode, always include the demo cards so the page is never empty
    const combined = isDemoMode ? [...DEMO_SAVED_LOADS, ...real] : real;
    setLoads(combined);
    setLoading(false);
  };

  useEffect(() => {
    loadSaved();
    const onStorage = (e: StorageEvent) => {
      if (e.key === BOOKMARKS_STORAGE_KEY) loadSaved();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={dashboardPath}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                <Bookmark className="h-6 w-6 text-primary" />
                Saved Loads
              </h1>
              <p className="text-sm text-muted-foreground">
                Loads you have bookmarked for later
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : loads.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardContent className="text-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No saved loads yet</h2>
              <p className="text-muted-foreground mb-6">
                No saved loads yet — browse loads and tap the bookmark icon to save them here.
              </p>
              <Button variant="default" asChild>
                <Link to={browsePath}>
                  <Package className="h-4 w-4 mr-2" />
                  Browse Loads
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              {loads.length} saved load{loads.length !== 1 ? 's' : ''}
            </div>
            {loads.map((load) => (
              <Card key={load.id} className="relative hover:shadow-md transition-shadow">
                <BookmarkButton id={load.id} className="absolute top-3 right-3 z-10" />
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 pr-10">
                      <div className="flex items-center gap-3 mb-3">
                        {load.isDemo && (
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                            Beta
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-lg font-medium text-foreground mb-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>
                          {load.origin_city}, {load.origin_country}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {load.destination_city}, {load.destination_country}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {load.pallets} pallets
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDateRange(load.pickup_date_from, load.pickup_date_to)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          {load.price ? `€${load.price}` : 'Open to offers'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {load.pricing_type === 'fixed' ? 'Fixed price' : 'Accepting offers'}
                        </div>
                      </div>
                      {!load.isDemo && (
                        <Button variant="default" asChild>
                          <Link to={`/load/${load.id}`}>
                            View Load
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
