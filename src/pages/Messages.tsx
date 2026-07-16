import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MessageInbox, MessageThread } from '@/components/messaging';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Shipment {
  id: string;
  status: string;
  shipper_id: string;
  carrier_id: string;
  load?: {
    origin_city: string;
    destination_city: string;
  };
}

export default function Messages() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  const isCarrier = role === 'carrier';
  const basePath = isCarrier ? '/dashboard/carrier' : '/dashboard/shipper';

  useEffect(() => {
    if (user) {
      if (shipmentId) {
        fetchShipment();
      } else {
        setLoading(false);
      }
    }
  }, [user, shipmentId]);

  const fetchShipment = async () => {
    if (!shipmentId) return;

    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          id,
          status,
          shipper_id,
          carrier_id,
          load:loads(origin_city, destination_city)
        `)
        .eq('id', shipmentId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setShipment({
          ...data,
          load: data.load as unknown as { origin_city: string; destination_city: string },
        });
      }
    } catch (error) {
      console.error('Error fetching shipment:', error);
      toast.error('Failed to load — please try refreshing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header — same style as My Loads */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={basePath}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Messages</h1>
              <p className="text-sm text-muted-foreground">
                Communicate with {isCarrier ? 'shippers' : 'carriers'} about your shipments.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {shipmentId ? (
            <div className="h-[calc(100vh-12rem)] flex flex-col bg-card rounded-xl border border-border overflow-hidden">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : shipment ? (
                <MessageThread
                  shipmentId={shipmentId}
                  shipment={shipment}
                  onBack={() => navigate(`${basePath}/messages`)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">Shipment not found or access denied.</p>
                </div>
              )}
            </div>
          ) : (
            <MessageInbox />
          )}
        </div>
      </main>
    </div>
  );
}
