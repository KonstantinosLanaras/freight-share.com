import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Package, MapPin, Calendar, Euro, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const cargoTypes = [
  { value: 'general', label: 'General Goods' },
  { value: 'fragile', label: 'Fragile' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'hazardous', label: 'Hazardous Materials' },
  { value: 'oversized', label: 'Oversized' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'other', label: 'Other' },
];

const countries = [
  'Netherlands', 'Germany', 'France', 'Belgium', 'Italy', 'Spain', 
  'Poland', 'Austria', 'Switzerland', 'Czech Republic', 'Denmark', 'Sweden'
];

export default function PostLoad() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openToOffers, setOpenToOffers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    originCity: '',
    originCountry: '',
    destinationCity: '',
    destinationCountry: '',
    pickupDateStart: '',
    pickupDateEnd: '',
    deliveryDateStart: '',
    deliveryDateEnd: '',
    pallets: '',
    cargoType: 'general',
    fixedPrice: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to post a load');
      return;
    }

    if (!formData.originCountry || !formData.destinationCountry) {
      toast.error('Please select both origin and destination countries');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('loads').insert({
        shipper_id: user.id,
        origin_city: formData.originCity,
        origin_country: formData.originCountry,
        destination_city: formData.destinationCity,
        destination_country: formData.destinationCountry,
        pickup_date_from: formData.pickupDateStart,
        pickup_date_to: formData.pickupDateEnd,
        delivery_date_from: formData.deliveryDateStart,
        delivery_date_to: formData.deliveryDateEnd,
        pallets: parseInt(formData.pallets),
        cargo_type: formData.cargoType as any,
        pricing_type: openToOffers ? 'open_to_offers' : 'fixed',
        price: openToOffers ? null : parseFloat(formData.fixedPrice) || null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast.success('Load posted successfully!');
      navigate('/dashboard/shipper');
    } catch (error: any) {
      console.error('Error posting load:', error);
      toast.error(error.message || 'Failed to post load');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard/shipper">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Post a New Load</h1>
              <p className="text-sm text-muted-foreground">Fill in the details to find carriers</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          {/* Origin & Destination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Route Details
              </CardTitle>
              <CardDescription>Where should the cargo be picked up and delivered?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Origin */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originCity">Origin City</Label>
                  <Input
                    id="originCity"
                    placeholder="e.g., Rotterdam"
                    className="mt-1"
                    value={formData.originCity}
                    onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="originCountry">Origin Country</Label>
                  <Select
                    value={formData.originCountry}
                    onValueChange={(value) => setFormData({ ...formData, originCountry: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Destination */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destinationCity">Destination City</Label>
                  <Input
                    id="destinationCity"
                    placeholder="e.g., Munich"
                    className="mt-1"
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="destinationCountry">Destination Country</Label>
                  <Select
                    value={formData.destinationCountry}
                    onValueChange={(value) => setFormData({ ...formData, destinationCountry: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Scheduling
              </CardTitle>
              <CardDescription>Specify your pickup and delivery windows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupDateStart">Pickup From</Label>
                  <Input
                    id="pickupDateStart"
                    type="date"
                    className="mt-1"
                    value={formData.pickupDateStart}
                    onChange={(e) => setFormData({ ...formData, pickupDateStart: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="pickupDateEnd">Pickup Until</Label>
                  <Input
                    id="pickupDateEnd"
                    type="date"
                    className="mt-1"
                    value={formData.pickupDateEnd}
                    onChange={(e) => setFormData({ ...formData, pickupDateEnd: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryDateStart">Delivery From</Label>
                  <Input
                    id="deliveryDateStart"
                    type="date"
                    className="mt-1"
                    value={formData.deliveryDateStart}
                    onChange={(e) => setFormData({ ...formData, deliveryDateStart: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDateEnd">Delivery Until</Label>
                  <Input
                    id="deliveryDateEnd"
                    type="date"
                    className="mt-1"
                    value={formData.deliveryDateEnd}
                    onChange={(e) => setFormData({ ...formData, deliveryDateEnd: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cargo Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Cargo Details
              </CardTitle>
              <CardDescription>Tell carriers what you're shipping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pallets">Number of Pallets</Label>
                  <Input
                    id="pallets"
                    type="number"
                    min="1"
                    placeholder="e.g., 12"
                    className="mt-1"
                    value={formData.pallets}
                    onChange={(e) => setFormData({ ...formData, pallets: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="cargoType">Cargo Type</Label>
                  <Select
                    value={formData.cargoType}
                    onValueChange={(value) => setFormData({ ...formData, cargoType: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cargoTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-primary" />
                Pricing
              </CardTitle>
              <CardDescription>Set your price or let carriers make offers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <div className="font-medium text-foreground">Open to offers</div>
                  <div className="text-sm text-muted-foreground">
                    Let carriers propose their own prices
                  </div>
                </div>
                <Switch
                  checked={openToOffers}
                  onCheckedChange={setOpenToOffers}
                  disabled={isSubmitting}
                />
              </div>

              {!openToOffers && (
                <div>
                  <Label htmlFor="fixedPrice">Fixed Price (€)</Label>
                  <Input
                    id="fixedPrice"
                    type="number"
                    min="0"
                    step="10"
                    placeholder="e.g., 850"
                    className="mt-1"
                    value={formData.fixedPrice}
                    onChange={(e) => setFormData({ ...formData, fixedPrice: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Additional Notes
              </CardTitle>
              <CardDescription>Any special instructions for carriers?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Loading dock available, forklift required, fragile handling needed..."
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="shipper" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Load'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
