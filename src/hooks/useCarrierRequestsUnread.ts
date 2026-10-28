import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const carrierRequestsLastViewedKey = (userId: string) =>
  `carrier-requests-last-viewed-${userId}`;

/**
 * Drives the "Offers & Requests" nav badge on the carrier dashboard.
 * Counts two things since the carrier last visited that page:
 *   1. New route_requests from shippers on my routes (I need to respond)
 *   2. My offers on loads that shippers have now accepted (I won a bid)
 */
export function useCarrierRequestsUnread() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const compute = async () => {
      const lastViewed = Number(
        localStorage.getItem(carrierRequestsLastViewedKey(user.id)) || 0
      );
      const sinceIso = new Date(lastViewed).toISOString();

      // New inbound route requests on my routes
      const { count: reqCount } = await supabase
        .from('route_requests')
        .select('id', { count: 'exact', head: true })
        .eq('carrier_id', user.id)
        .eq('status', 'sent')
        .gt('created_at', sinceIso);

      // My offers that a shipper just accepted
      const { count: acceptedCount } = await supabase
        .from('offers')
        .select('id', { count: 'exact', head: true })
        .eq('carrier_id', user.id)
        .eq('is_accepted', true)
        .gt('updated_at', sinceIso);

      if (!cancelled) setCount((reqCount || 0) + (acceptedCount || 0));
    };

    compute();
    const timer = setInterval(compute, 30_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [user]);

  return count;
}
