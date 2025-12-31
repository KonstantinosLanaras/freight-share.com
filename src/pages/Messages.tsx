import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MessageInbox, MessageThread } from '@/components/messaging';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, TrendingUp, Package, Truck, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  full_name: string | null;
  company_name: string | null;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected' | null;
}

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  const isCarrier = role === 'carrier';
  const basePath = isCarrier ? '/dashboard/carrier' : '/dashboard/shipper';

  const navItems = isCarrier ? [
    { label: 'Dashboard', href: '/dashboard/carrier', icon: TrendingUp },
    { label: 'Browse Loads', href: '/dashboard/carrier/find-loads', icon: Package },
    { label: 'Shipments', href: '/dashboard/carrier/shipments', icon: Truck },
    { label: 'Messages', href: '/dashboard/carrier/messages', icon: MessageSquare },
    { label: 'My Routes', href: '/dashboard/carrier/routes', icon: MapPin },
  ] : [
    { label: 'Dashboard', href: '/dashboard/shipper', icon: TrendingUp },
    { label: 'My Loads', href: '/dashboard/shipper/loads', icon: Package },
    { label: 'Shipments', href: '/dashboard/shipper/shipments', icon: Truck },
    { label: 'Messages', href: '/dashboard/shipper/messages', icon: MessageSquare },
    { label: 'Browse Routes', href: '/routes', icon: MapPin },
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
      if (shipmentId) {
        fetchShipment();
      } else {
        setLoading(false);
      }
    }
  }, [user, shipmentId]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, company_name, verification_status')
      .eq('id', user.id)
      .maybeSingle();
    setProfile(data);
  };

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
      
      // Transform the data structure
      if (data) {
        setShipment({
          ...data,
          load: data.load as unknown as { origin_city: string; destination_city: string }
        });
      }
    } catch (error) {
      console.error('Error fetching shipment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout 
      role={isCarrier ? 'carrier' : 'shipper'} 
      navItems={navItems}
      profile={profile}
    >
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
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">Messages</h1>
                <p className="text-muted-foreground">
                  Communicate with {isCarrier ? 'shippers' : 'carriers'} about your shipments.
                </p>
              </div>
            </div>
            <MessageInbox />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
