import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Counts route_request updates where the carrier responded (counter, accept, reject)
 * since the shipper last opened the /offers/shipper page.
 * Load-offer notifications live separately in useShipperLoadsUnread.
 */
export function useShipperOffersUnread() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const compute = async () => {
      const lastViewed = Number(localStorage.getItem(`offers-shipper-last-viewed-${user.id}`) || 0);
      const sinceIso = new Date(lastViewed).toISOString();

      // Route requests I made where the carrier has since responded
      const { count: n } = await supabase
        .from('route_requests')
        .select('id', { count: 'exact', head: true })
        .eq('shipper_id', user.id)
        .neq('status', 'sent')
        .gt('updated_at', sinceIso);

      if (!cancelled) setCount(n || 0);
    };

    compute();
    const t = setInterval(compute, 30_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [user]);

  return count;
}
