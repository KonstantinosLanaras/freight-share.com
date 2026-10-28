import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const loadsLastViewedKey = (userId: string) => `loads-last-viewed-${userId}`;

/**
 * Counts new carrier offers on the shipper's loads since they last visited
 * the My Loads page — drives the "My Loads" nav badge.
 */
export function useShipperLoadsUnread() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const compute = async () => {
      const lastViewed = Number(localStorage.getItem(loadsLastViewedKey(user.id)) || 0);
      const sinceIso = new Date(lastViewed).toISOString();

      const { data: myLoads } = await supabase
        .from('loads')
        .select('id')
        .eq('shipper_id', user.id);

      const loadIds = (myLoads || []).map((l: any) => l.id);
      if (!loadIds.length) { if (!cancelled) setCount(0); return; }

      const { count: n } = await supabase
        .from('offers')
        .select('id', { count: 'exact', head: true })
        .in('load_id', loadIds)
        .gt('created_at', sinceIso);

      if (!cancelled) setCount(n || 0);
    };

    compute();
    const timer = setInterval(compute, 30_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [user]);

  return count;
}
