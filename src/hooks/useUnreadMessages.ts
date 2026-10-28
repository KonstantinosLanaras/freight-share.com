import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const messagesLastViewedKey = (userId: string) => `messages-last-viewed-${userId}`;

export function useUnreadMessages() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const compute = async () => {
      const lastViewed = Number(localStorage.getItem(messagesLastViewedKey(user.id)) || 0);
      const sinceIso = new Date(lastViewed).toISOString();

      const { data: shipments } = await supabase
        .from('shipments')
        .select('id')
        .or(`shipper_id.eq.${user.id},carrier_id.eq.${user.id}`);

      const ids = (shipments || []).map((s: any) => s.id);
      if (!ids.length) { if (!cancelled) setCount(0); return; }

      const { count: n } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('shipment_id', ids)
        .neq('sender_id', user.id)
        .gt('created_at', sinceIso);

      if (!cancelled) setCount(n || 0);
    };

    compute();
    const timer = setInterval(compute, 30_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [user]);

  return count;
}
