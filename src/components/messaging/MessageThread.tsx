import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, User, ArrowLeft, Package, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface MessageThreadProps {
  shipmentId: string;
  shipment?: {
    id: string;
    status: string;
    shipper_id: string;
    carrier_id: string;
    load?: {
      origin_city: string;
      destination_city: string;
    };
  };
  onBack?: () => void;
}

export function MessageThread({ shipmentId, shipment, onBack }: MessageThreadProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isReadOnly = shipment?.status === 'completed' || shipment?.status === 'cancelled';
  const isShipper = user?.id === shipment?.shipper_id;

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `shipment_id=eq.${shipmentId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shipmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isReadOnly) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        shipment_id: shipmentId,
        sender_id: user.id,
        content: newMessage.trim()
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {shipment?.load?.origin_city} → {shipment?.load?.destination_city}
              </span>
              <Badge variant={shipment?.status === 'completed' ? 'default' : 'secondary'}>
                {shipment?.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {isShipper ? (
                <>
                  <Truck className="h-3 w-3" />
                  Carrier
                </>
              ) : (
                <>
                  <Package className="h-3 w-3" />
                  Shipper
                </>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/shipment/${shipmentId}`}>View Shipment</Link>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-card border border-border rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {format(new Date(message.created_at), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isReadOnly ? (
        <div className="p-4 bg-muted/50 border-t border-border text-center text-sm text-muted-foreground">
          This conversation is read-only because the shipment is {shipment?.status}.
        </div>
      ) : (
        <form onSubmit={sendMessage} className="p-4 bg-card border-t border-border">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
