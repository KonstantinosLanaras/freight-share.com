import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, MapPin, Package, Truck, Calendar, Send, Loader2,
  MessageSquare, Clock, CheckCircle, XCircle, Eye, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  sent: { label: 'Sent', icon: Send, color: 'bg-primary/10 text-primary' },
  viewed: { label: 'Viewed', icon: Eye, color: 'bg-accent/10 text-accent' },
  in_discussion: { label: 'In Discussion', icon: MessageSquare, color: 'bg-accent/10 text-accent' },
  accepted: { label: 'Accepted', icon: CheckCircle, color: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-destructive/10 text-destructive' },
  expired: { label: 'Expired', icon: Clock, color: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-muted text-muted-foreground' },
};

export default function RouteRequestStatus() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [carrierProfile, setCarrierProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (requestId) fetchData();
  }, [requestId]);

  useEffect(() => {
    if (!requestId) return;
    const channel = supabase
      .channel(`request-msgs-${requestId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'route_request_messages',
        filter: `request_id=eq.${requestId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async () => {
    try {
      const { data: req, error } = await supabase
        .from('route_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      if (error) throw error;
      setRequest(req);

      const [routeRes, profileRes, msgsRes] = await Promise.all([
        supabase.from('routes').select('*').eq('id', req.route_id).single(),
        supabase.from('public_profiles').select('full_name, company_name').eq('id', req.carrier_id).single(),
        supabase.from('route_request_messages').select('*').eq('request_id', requestId).order('created_at', { ascending: true }),
      ]);

      setRoute(routeRes.data);
      setCarrierProfile(profileRes.data);
      setMessages(msgsRes.data || []);
    } catch {
      toast.error('Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !requestId) return;
    setSending(true);
    try {
      const { error } = await supabase.from('route_request_messages').insert({
        request_id: requestId,
        sender_id: user.id,
        content: newMessage.trim(),
        is_system: false,
      });
      if (error) throw error;
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const cancelRequest = async () => {
    if (!requestId) return;
    try {
      await supabase.from('route_requests').update({ status: 'cancelled' }).eq('id', requestId);
      await supabase.from('route_request_messages').insert({
        request_id: requestId,
        sender_id: user!.id,
        content: 'Request cancelled by shipper',
        is_system: true,
      });
      setRequest({ ...request, status: 'cancelled' });
      toast.success('Request cancelled');
    } catch {
      toast.error('Failed to cancel');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!request) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Request not found</p></div>;
  }

  const status = statusConfig[request.status] || statusConfig.sent;
  const StatusIcon = status.icon;
  const isActive = !['rejected', 'expired', 'cancelled', 'accepted'].includes(request.status);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-heading font-bold text-foreground">Request Status</h1>
                  <Badge className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Request #{request.id.slice(0, 8)}
                </p>
              </div>
            </div>
            {isActive && (
              <Button variant="outline" size="sm" onClick={cancelRequest} className="text-destructive">
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Request Summary */}
            <Card>
              <CardHeader><CardTitle className="text-base">Request Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carrier</span>
                  <span className="font-medium">{carrierProfile?.company_name || carrierProfile?.full_name || 'Carrier'}</span>
                </div>
                {route && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium">{route.origin_city} → {route.destination_city}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup</span>
                  <span className="font-medium text-right max-w-[180px] truncate">{request.pickup_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-right max-w-[180px] truncate">{request.delivery_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goods</span>
                  <span className="font-medium">{request.goods_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pallets</span>
                  <span className="font-medium">{request.pallets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{request.weight_kg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{format(new Date(request.shipment_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sent</span>
                  <span className="font-medium">{format(new Date(request.created_at), 'MMM d, HH:mm')}</span>
                </div>
              </CardContent>
            </Card>

            {request.status === 'accepted' && (
              <Card className="border-success/30 bg-success/5">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="font-medium text-success">Request Accepted!</p>
                  <p className="text-sm text-muted-foreground mt-1">The carrier has accepted your load request.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right — Conversation */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={msg.is_system ? 'text-center' : msg.sender_id === user?.id ? 'text-right' : 'text-left'}>
                    {msg.is_system ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground">
                        <AlertTriangle className="h-3 w-3" />
                        {msg.content}
                        <span className="text-[10px]">{format(new Date(msg.created_at), 'HH:mm')}</span>
                      </div>
                    ) : (
                      <div className={`inline-block max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={sending}
                  />
                  <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
