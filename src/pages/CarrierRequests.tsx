import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, MapPin, Package, Loader2, Clock, ArrowRight, Inbox
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; color: string }> = {
  sent: { label: 'New', color: 'bg-primary/10 text-primary' },
  viewed: { label: 'Viewed', color: 'bg-accent/10 text-accent' },
  in_discussion: { label: 'In Discussion', color: 'bg-accent/10 text-accent' },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive' },
  expired: { label: 'Expired', color: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
};

export default function CarrierRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('route_requests')
        .select('*')
        .eq('carrier_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const routeIds = [...new Set(data?.map(r => r.route_id) || [])];
      const shipperIds = [...new Set(data?.map(r => r.shipper_id) || [])];

      const [routesRes, profilesRes] = await Promise.all([
        supabase.from('routes').select('id, origin_city, destination_city').in('id', routeIds),
        supabase.from('public_profiles').select('id, full_name, company_name').in('id', shipperIds),
      ]);

      const routeMap = new Map(routesRes.data?.map(r => [r.id, r]) || []);
      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);

      setRequests(data?.map(r => ({
        ...r,
        route: routeMap.get(r.route_id),
        shipper: profileMap.get(r.shipper_id),
      })) || []);
    } catch {
      console.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/carrier')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Route Requests</h1>
              <p className="text-sm text-muted-foreground">Review incoming load requests from shippers</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardContent className="text-center py-12">
              <Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No incoming requests</h2>
              <p className="text-muted-foreground">When shippers request space on your routes, they'll appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const st = statusConfig[req.status] || statusConfig.sent;
              return (
                <Card
                  key={req.id}
                  className={`hover:shadow-md transition-shadow cursor-pointer ${req.status === 'sent' ? 'border-l-4 border-l-primary' : ''}`}
                  onClick={() => navigate(`/dashboard/carrier/requests/${req.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-foreground">
                            {req.shipper?.company_name || req.shipper?.full_name || 'Shipper'}
                          </span>
                          <Badge className={st.color}>{st.label}</Badge>
                        </div>
                        {req.route && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3.5 w-3.5" />
                            {req.route.origin_city} → {req.route.destination_city}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>{req.pickup_address} → {req.delivery_address}</span>
                          <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {req.pallets} pallets · {req.goods_type}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(req.created_at), 'MMM d, HH:mm')}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
