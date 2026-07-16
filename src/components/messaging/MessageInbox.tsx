import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Package, Truck, ArrowRight, Inbox } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Conversation {
  shipment_id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  counterparty_name: string;
  counterparty_company: string;
  is_shipper: boolean;
  status: string;
  origin_city: string;
  destination_city: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  posted: { label: 'Posted', className: 'bg-muted text-muted-foreground' },
  accepted: { label: 'Accepted', className: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Paid', className: 'bg-primary/10 text-primary' },
  picked_up: { label: 'In Transit', className: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', className: 'bg-success/10 text-success' },
  completed: { label: 'Completed', className: 'bg-success text-success-foreground' },
};

export function MessageInbox() {
  const { user, role } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Fetch shipments where user is either shipper or carrier
      const { data: shipments, error } = await supabase
        .from('shipments')
        .select(`
          id,
          status,
          shipper_id,
          carrier_id,
          load:loads(origin_city, destination_city)
        `)
        .or(`shipper_id.eq.${user.id},carrier_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get unique profile IDs
      const profileIds = new Set<string>();
      shipments?.forEach(s => {
        if (s.shipper_id !== user.id) profileIds.add(s.shipper_id);
        if (s.carrier_id !== user.id) profileIds.add(s.carrier_id);
      });

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('id, full_name, company_name')
        .in('id', Array.from(profileIds));

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Fetch last message for each shipment
      const conversationsWithMessages = await Promise.all(
        (shipments || []).map(async (shipment) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('shipment_id', shipment.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastMessage = messages?.[0];
          const isShipper = shipment.shipper_id === user.id;
          const counterpartyId = isShipper ? shipment.carrier_id : shipment.shipper_id;
          const counterparty = profileMap.get(counterpartyId);

          return {
            shipment_id: shipment.id,
            last_message: lastMessage?.content || 'No messages yet',
            last_message_at: lastMessage?.created_at || shipment.id,
            unread_count: 0, // Would need a separate read tracking table
            counterparty_name: counterparty?.full_name || 'Unknown',
            counterparty_company: counterparty?.company_name || '',
            is_shipper: isShipper,
            status: shipment.status,
            origin_city: shipment.load?.origin_city || '',
            destination_city: shipment.load?.destination_city || '',
          };
        })
      );

      // Filter out conversations with no messages or very old
      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load — please try refreshing');
    } finally {
      setLoading(false);
    }
  };

  const basePath = role === 'carrier' ? '/dashboard/carrier' : '/dashboard/shipper';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
          <p className="text-muted-foreground mb-4">
            Messages will appear here once you have active shipments.
          </p>
          <Button asChild>
            <Link to={role === 'carrier' ? '/dashboard/carrier/find-loads' : '/routes'}>
              {role === 'carrier' ? 'Browse Loads' : 'Browse Routes'}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => (
        <Link
          key={conv.shipment_id}
          to={`${basePath}/messages/${conv.shipment_id}`}
          className="block"
        >
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  conv.is_shipper ? 'bg-carrier/10' : 'bg-shipper/10'
                }`}>
                  {conv.is_shipper ? (
                    <Truck className="h-5 w-5 text-carrier" />
                  ) : (
                    <Package className="h-5 w-5 text-shipper" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">
                      {conv.counterparty_company || conv.counterparty_name}
                    </span>
                    <Badge className={statusConfig[conv.status]?.className || ''}>
                      {statusConfig[conv.status]?.label || conv.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {conv.origin_city} → {conv.destination_city}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conv.last_message}
                  </p>
                </div>

                {/* Time & Arrow */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-2">
                    {conv.last_message_at && format(new Date(conv.last_message_at), 'MMM d')}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
