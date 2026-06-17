import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Counts shipper offers (route_requests updated by the carrier, and offers received on my loads)
 * that arrived after the user last opened the /offers/shipper page.
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

      // 1) Updates to my route_requests where carrier acted (status != 'sent')
      const { data: reqs } = await supabase
        .from('route_requests')
        .select('id, status, updated_at')
        .eq('shipper_id', user.id)
        .neq('status', 'sent')
        .gt('updated_at', sinceIso);

      // 2) New offers on my loads
      const { data: myLoads } = await supabase
        .from('loads')
        .select('id')
        .eq('shipper_id', user.id);
      const loadIds = (myLoads || []).map((l: any) => l.id);

      let offerCount = 0;
      if (loadIds.length) {
        const { data: offs } = await supabase
          .from('offers')
          .select('id, created_at')
          .in('load_id', loadIds)
          .gt('created_at', sinceIso);
        offerCount = offs?.length || 0;
      }

      if (!cancelled) setCount((reqs?.length || 0) + offerCount);
    };

    compute();
    const t = setInterval(compute, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, [user]);

  return count;
}
