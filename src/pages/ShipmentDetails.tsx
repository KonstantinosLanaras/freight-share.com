import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  Euro, 
  MessageSquare,
  CheckCircle,
  Clock,
  FileText,
  Star,
  User,
  HelpCircle,
  Navigation,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DetailedRatingForm, DetailedRatingDisplay } from '@/components/ratings';

// Mock shipment data - in real app, fetch from DB
const shipment = {
  id: 'SHP-2024-001',
  status: 'picked_up',
  paymentStatus: 'paid',
  origin: 'Rotterdam, Netherlands',
  destination: 'Munich, Germany',
  pallets: 12,
  cargoType: 'General Goods',
  price: 850,
  pickupDate: 'Dec 20, 2024',
  deliveryDate: 'Dec 22, 2024',
  shipper: {
    name: 'John Doe',
    company: 'Acme Logistics',
    rating: 4.8,
  },
  carrier: {
    name: 'Transport Co',
    company: 'EuroFreight GmbH',
    rating: 4.9,
  },
  tracking: {
    lastUpdate: '2 hours ago',
    currentLocation: 'Frankfurt, Germany',
    estimatedArrival: 'Dec 22, 2024 14:00',
    progress: 65,
  },
  timeline: [
    { status: 'Posted', date: 'Dec 15, 2024 09:30', completed: true },
    { status: 'Accepted', date: 'Dec 15, 2024 14:22', completed: true },
    { status: 'Paid', date: 'Dec 16, 2024 10:15', completed: true },
    { status: 'Picked Up', date: 'Dec 20, 2024 08:00', completed: true },
    { status: 'In Transit', date: 'Dec 20, 2024 09:30', completed: true, current: true },
    { status: 'Delivered', date: '', completed: false },
    { status: 'Completed', date: '', completed: false },
  ],
};

const statusConfig: Record<string, { label: string; className: string }> = {
  posted: { label: 'Posted', className: 'bg-muted text-muted-foreground' },
  accepted: { label: 'Accepted', className: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Paid', className: 'bg-primary/10 text-primary' },
  picked_up: { label: 'In Transit', className: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', className: 'bg-success/10 text-success' },
  completed: { label: 'Completed', className: 'bg-success text-success-foreground' },
};

export default function ShipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);
  const [otherPartyRating, setOtherPartyRating] = useState<any>(null);
  
  const backPath = role === 'carrier' ? '/dashboard/carrier/shipments' : '/dashboard/shipper/shipments';

  // Check if user has already rated and fetch other party's rating
  useEffect(() => {
    const fetchRatings = async () => {
      if (!user || !id) return;
      
      // Check if user already rated
      const { data: myRating } = await supabase
        .from('detailed_ratings')
        .select('*')
        .eq('shipment_id', id)
        .eq('rater_id', user.id)
        .maybeSingle();
      
      setExistingRating(myRating);
      
      // Fetch the other party's rating of us
      const { data: theirRating } = await supabase
        .from('detailed_ratings')
        .select('*')
        .eq('shipment_id', id)
        .eq('rated_id', user.id)
        .maybeSingle();
      
      setOtherPartyRating(theirRating);
    };
    
    fetchRatings();
  }, [user, id]);

  const canRate = shipment.status === 'completed' && !existingRating;
  const ratedPartyId = role === 'carrier' ? 'shipper-id' : 'carrier-id'; // In real app, get from shipment data
  const ratedPartyName = role === 'carrier' ? shipment.shipper.name : shipment.carrier.name;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-heading font-bold text-foreground">
                    {shipment.id}
                  </h1>
                  <Badge className={statusConfig[shipment.status].className}>
                    {statusConfig[shipment.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {shipment.origin} → {shipment.destination}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to={`/help?shipment=${shipment.id}`}>
                  <HelpCircle className="h-4 w-4" />
                  Get Help
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/dashboard/${role === 'carrier' ? 'carrier' : 'shipper'}/messages/${id}`}>
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Card - MVP Critical */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Live Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Location</div>
                    <div className="font-semibold text-lg flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {shipment.tracking.currentLocation}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Last Update</div>
                    <div className="font-medium">{shipment.tracking.lastUpdate}</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Route Progress</span>
                    <span className="font-medium">{shipment.tracking.progress}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${shipment.tracking.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{shipment.origin.split(',')[0]}</span>
                    <span>{shipment.destination.split(',')[0]}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="text-sm text-muted-foreground">Estimated Arrival</div>
                  <div className="font-semibold text-primary">{shipment.tracking.estimatedArrival}</div>
                </div>
              </CardContent>
            </Card>

            {/* Route Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shipment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Origin</div>
                    <div className="font-medium">{shipment.origin}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Pickup: {shipment.pickupDate}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Destination</div>
                    <div className="font-medium">{shipment.destination}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Delivery: {shipment.deliveryDate}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Pallets</div>
                    <div className="font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      {shipment.pallets}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Cargo Type</div>
                    <div className="font-medium">{shipment.cargoType}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Price</div>
                    <div className="font-medium flex items-center gap-2">
                      <Euro className="h-4 w-4 text-primary" />
                      {shipment.price}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Status Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipment.timeline.map((item, index) => (
                    <div key={item.status} className="flex gap-4">
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.completed 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        } ${item.current ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                          {item.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        {index < shipment.timeline.length - 1 && (
                          <div className={`absolute top-10 left-1/2 w-0.5 h-8 -translate-x-1/2 ${
                            item.completed ? 'bg-primary/50' : 'bg-border'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className={`font-medium ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {item.status}
                          {item.current && (
                            <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                          )}
                        </div>
                        {item.date && (
                          <div className="text-sm text-muted-foreground">{item.date}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transaction Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Transaction Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    View the binding transport agreement with all shipment details.
                  </p>
                  <Button variant="outline">
                    Download Contract PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rating Section - Only show for completed shipments */}
            {shipment.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-warning" />
                    Ratings & Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Show rating form or existing rating */}
                  {showRatingForm && user ? (
                    <DetailedRatingForm
                      shipmentId={id || ''}
                      raterId={user.id}
                      ratedId={ratedPartyId}
                      raterRole={role as 'shipper' | 'carrier'}
                      ratedName={ratedPartyName}
                      onSuccess={() => {
                        setShowRatingForm(false);
                        setExistingRating({ submitted: true });
                      }}
                      onCancel={() => setShowRatingForm(false)}
                    />
                  ) : existingRating ? (
                    <div className="p-4 bg-success/10 rounded-lg">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">You've already rated this shipment</span>
                      </div>
                    </div>
                  ) : canRate ? (
                    <div className="text-center py-4">
                      <Star className="h-10 w-10 text-warning mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">
                        Rate your experience with the {role === 'carrier' ? 'shipper' : 'carrier'}
                      </p>
                      <Button onClick={() => setShowRatingForm(true)}>
                        <Star className="h-4 w-4 mr-2" />
                        Leave a Rating
                      </Button>
                    </div>
                  ) : null}

                  {/* Show rating received from other party */}
                  {otherPartyRating && (
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Rating from {role === 'carrier' ? 'Shipper' : 'Carrier'}
                      </h4>
                      <DetailedRatingDisplay
                        timeliness={otherPartyRating.timeliness_score}
                        communication={otherPartyRating.communication_score}
                        reliability={otherPartyRating.reliability_score}
                        accuracy={otherPartyRating.accuracy_score}
                        comment={otherPartyRating.comment}
                        raterRole={otherPartyRating.rater_role}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Parties & Actions */}
          <div className="space-y-6">
            {/* Shipper */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4 text-primary" />
                  Shipper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{shipment.shipper.name}</div>
                    <div className="text-sm text-muted-foreground">{shipment.shipper.company}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 text-accent fill-accent" />
                      {shipment.shipper.rating}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carrier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-4 w-4 text-primary" />
                  Carrier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{shipment.carrier.name}</div>
                    <div className="text-sm text-muted-foreground">{shipment.carrier.company}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 text-accent fill-accent" />
                      {shipment.carrier.rating}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-primary">Payment Authorised</div>
                    <div className="text-sm text-muted-foreground">
                      €{shipment.price} — executes on delivery confirmation
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {role === 'carrier' && (
                  <Button variant="default" className="w-full">
                    <CheckCircle className="h-4 w-4" />
                    Mark as Delivered
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4" />
                  Message {role === 'carrier' ? 'Shipper' : 'Carrier'}
                </Button>
              </CardContent>
            </Card>

            {/* Help Link */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Need Help?</div>
                    <div className="text-xs text-muted-foreground">
                      Report an issue with this shipment
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3" asChild>
                  <Link to={`/help?shipment=${shipment.id}`}>
                    <AlertTriangle className="h-4 w-4" />
                    Report Issue
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
