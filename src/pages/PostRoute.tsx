import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Truck, MapPin, Calendar, Plus, X, Package, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RouteStop {
  id: string;
  city: string;
  country: string;
  availablePallets: string;
  plannedDateTime: string;
}

const countries = [
  'Netherlands', 'Germany', 'France', 'Belgium', 'Italy', 'Spain', 
  'Poland', 'Austria', 'Switzerland', 'Czech Republic', 'Denmark', 'Sweden',
  'Portugal', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Croatia',
  'Slovenia', 'Slovakia', 'Luxembourg', 'Ireland', 'Finland', 'Norway'
];

const vehicleTypes = [
  { value: 'standard_truck', label: 'Standard Trailer (13.6m)' },
  { value: 'box_truck', label: 'Box Truck' },
  { value: 'refrigerated_truck', label: 'Refrigerated (Reefer)' },
  { value: 'curtain_sider', label: 'Curtain Sider' },
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'livestock_carrier', label: 'Livestock Carrier' },
  { value: 'car_transporter', label: 'Car Transporter' },
];

export default function PostRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    originCity: '',
    originCountry: '',
    originPallets: '',
    originPlannedDateTime: '',
    destinationCity: '',
    destinationCountry: '',
    destinationPlannedDateTime: '',
    departureStart: '',
    departureTime: '',
    departureEnd: '',
    arrivalStart: '',
    arrivalEnd: '',
    vehicleType: '',
    notes: '',
    openToExtraStops: false,
    flexibilityNote: '',
  });

  const addStop = () => {
    setStops([
      ...stops,
      { id: crypto.randomUUID(), city: '', country: '', availablePallets: '', plannedDateTime: '' }
    ]);
  };

  const removeStop = (id: string) => {
    setStops(stops.filter(stop => stop.id !== id));
  };

  const updateStop = (id: string, field: keyof RouteStop, value: string) => {
    setStops(stops.map(stop => 
      stop.id === id ? { ...stop, [field]: value } : stop
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to post a route');
      return;
    }

    if (!formData.originCountry || !formData.destinationCountry) {
      toast.error('Please select both origin and destination countries');
      return;
    }

    if (!formData.originPallets || parseInt(formData.originPallets) < 1) {
      toast.error('Please enter available pallet capacity');
      return;
    }

    if (!formData.vehicleType) {
      toast.error('Please select a vehicle type');
      return;
    }

    if (!formData.arrivalStart) {
      toast.error('Please enter an expected arrival date');
      return;
    }

    if (!formData.departureTime) {
      toast.error('Please enter a departure time');
      return;
    }

    if (!formData.originPlannedDateTime) {
      toast.error('Please enter a planned departure date/time for origin');
      return;
    }

    if (!formData.destinationPlannedDateTime) {
      toast.error('Please enter a planned arrival date/time for destination');
      return;
    }

    // Validate stops have planned datetime
    for (const stop of stops) {
      if (!stop.plannedDateTime) {
        toast.error('Please enter planned date/time for all stops');
        return;
      }
    }

    if (formData.openToExtraStops && !formData.flexibilityNote.trim()) {
      toast.error('Please describe your flexibility for extra stops');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the route with new fields
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .insert({
          carrier_id: user.id,
          origin_city: formData.originCity,
          origin_country: formData.originCountry,
          destination_city: formData.destinationCity,
          destination_country: formData.destinationCountry,
          departure_date_from: formData.departureStart,
          departure_date_to: formData.departureEnd,
          departure_time: formData.departureTime || null,
          arrival_date_from: formData.arrivalStart,
          arrival_date_to: formData.arrivalEnd || null,
          available_pallets: parseInt(formData.originPallets),
          vehicle_type: formData.vehicleType,
          vehicle_constraints: vehicleTypes.find(v => v.value === formData.vehicleType)?.label || null,
          notes: formData.notes || null,
          status: 'planned',
          open_to_extra_stops: formData.openToExtraStops,
          flexibility_note: formData.openToExtraStops ? formData.flexibilityNote.trim() : null,
        })
        .select()
        .single();

      if (routeError) throw routeError;

      // Create route stops if any
      if (stops.length > 0) {
        const stopsToInsert = stops.map((stop, index) => ({
          route_id: routeData.id,
          city: stop.city,
          country: stop.country,
          available_pallets: parseInt(stop.availablePallets) || 0,
          stop_order: index + 1,
          planned_datetime: stop.plannedDateTime ? new Date(stop.plannedDateTime).toISOString() : null,
        }));

        const { error: stopsError } = await supabase
          .from('route_stops')
          .insert(stopsToInsert);

        if (stopsError) throw stopsError;
      }

      toast.success('Route posted successfully!');
      navigate('/dashboard/carrier/routes');
    } catch (error: any) {
      console.error('Error posting route:', error);
      toast.error(error.message || 'Failed to post route');
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
              <Link to="/dashboard/carrier">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Post a New Route</h1>
              <p className="text-sm text-muted-foreground">Share your upcoming journey to find loads</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Routes represent real planned journeys</p>
              <p>Post your actual planned trips to get matched with shippers who need to move cargo along your route. Keep your routes updated for accurate matching.</p>
            </div>
          </div>

          {/* Origin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-carrier" />
                Starting Point
              </CardTitle>
              <CardDescription>Where does your journey begin?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="originCity">City <span className="text-destructive">*</span></Label>
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
                  <Label htmlFor="originCountry">Country <span className="text-destructive">*</span></Label>
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
                <div>
                  <Label htmlFor="originPallets">Available Pallets <span className="text-destructive">*</span></Label>
                  <Input
                    id="originPallets"
                    type="number"
                    min="1"
                    max="66"
                    placeholder="e.g., 24"
                    className="mt-1"
                    value={formData.originPallets}
                    onChange={(e) => setFormData({ ...formData, originPallets: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="originPlannedDateTime">Planned Departure <span className="text-destructive">*</span></Label>
                  <Input
                    id="originPlannedDateTime"
                    type="datetime-local"
                    className="mt-1"
                    value={formData.originPlannedDateTime}
                    onChange={(e) => setFormData({ ...formData, originPlannedDateTime: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stops */}
          {stops.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-carrier" />
                  Intermediate Stops
                </CardTitle>
                <CardDescription>Cities where you can load or unload cargo along the way</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="relative p-4 rounded-lg bg-muted/50">
                    <button
                      type="button"
                      onClick={() => removeStop(stop.id)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="text-sm font-medium text-muted-foreground mb-3">Stop {index + 1}</div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label>City <span className="text-destructive">*</span></Label>
                        <Input
                          placeholder="e.g., Düsseldorf"
                          className="mt-1"
                          value={stop.city}
                          onChange={(e) => updateStop(stop.id, 'city', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label>Country <span className="text-destructive">*</span></Label>
                        <Select
                          value={stop.country}
                          onValueChange={(value) => updateStop(stop.id, 'country', value)}
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
                      <div>
                        <Label>Available pallets <span className="text-destructive">*</span></Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g., 18"
                          className="mt-1"
                          value={stop.availablePallets}
                          onChange={(e) => updateStop(stop.id, 'availablePallets', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label>Planned time <span className="text-destructive">*</span></Label>
                        <Input
                          type="datetime-local"
                          className="mt-1"
                          value={stop.plannedDateTime}
                          onChange={(e) => updateStop(stop.id, 'plannedDateTime', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Button type="button" variant="outline" className="w-full" onClick={addStop} disabled={isSubmitting}>
            <Plus className="h-4 w-4" />
            Add Intermediate Stop
          </Button>

          {/* Destination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-carrier" />
                Final Destination
              </CardTitle>
              <CardDescription>Where does your journey end?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="destinationCity">City <span className="text-destructive">*</span></Label>
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
                  <Label htmlFor="destinationCountry">Country <span className="text-destructive">*</span></Label>
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
                <div>
                  <Label htmlFor="destinationPlannedDateTime">Planned Arrival <span className="text-destructive">*</span></Label>
                  <Input
                    id="destinationPlannedDateTime"
                    type="datetime-local"
                    className="mt-1"
                    value={formData.destinationPlannedDateTime}
                    onChange={(e) => setFormData({ ...formData, destinationPlannedDateTime: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-carrier" />
                Schedule
              </CardTitle>
              <CardDescription>When are you planning this journey?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Departure Window <span className="text-destructive">*</span></Label>
                <div className="grid sm:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="departureStart" className="text-sm text-muted-foreground">Earliest Departure</Label>
                    <Input
                      id="departureStart"
                      type="date"
                      className="mt-1"
                      value={formData.departureStart}
                      onChange={(e) => setFormData({ ...formData, departureStart: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="departureTime" className="text-sm text-muted-foreground">Departure Time</Label>
                    <Input
                      id="departureTime"
                      type="time"
                      className="mt-1"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="departureEnd" className="text-sm text-muted-foreground">Latest Departure</Label>
                    <Input
                      id="departureEnd"
                      type="date"
                      className="mt-1"
                      value={formData.departureEnd}
                      onChange={(e) => setFormData({ ...formData, departureEnd: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Arrival Window <span className="text-destructive">*</span></Label>
                <p className="text-sm text-muted-foreground mb-2">Earliest arrival is required for matching</p>
                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="arrivalStart" className="text-sm text-muted-foreground">Earliest Arrival</Label>
                    <Input
                      id="arrivalStart"
                      type="date"
                      className="mt-1"
                      value={formData.arrivalStart}
                      onChange={(e) => setFormData({ ...formData, arrivalStart: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="arrivalEnd" className="text-sm text-muted-foreground">Latest Arrival (optional)</Label>
                    <Input
                      id="arrivalEnd"
                      type="date"
                      className="mt-1"
                      value={formData.arrivalEnd}
                      onChange={(e) => setFormData({ ...formData, arrivalEnd: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Flexibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-carrier" />
                Route Flexibility
              </CardTitle>
              <CardDescription>Can you accommodate additional pickup stops along your route?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="openToExtraStops"
                  checked={formData.openToExtraStops}
                  onCheckedChange={(checked) => setFormData({ ...formData, openToExtraStops: checked === true })}
                  disabled={isSubmitting}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="openToExtraStops"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Open to additional pickup stops
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Allow shippers to request pickup deviations from your planned route
                  </p>
                </div>
              </div>

              {formData.openToExtraStops && (
                <div>
                  <Label htmlFor="flexibilityNote">
                    Describe your flexibility <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="flexibilityNote"
                    placeholder="e.g., Can deviate up to 50km from route, max 2 extra stops, flexible on timing within 2-hour windows..."
                    className="mt-1 min-h-[80px]"
                    value={formData.flexibilityNote}
                    onChange={(e) => setFormData({ ...formData, flexibilityNote: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-carrier" />
                Vehicle & Additional Info
              </CardTitle>
              <CardDescription>Vehicle type is required for cargo matching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vehicleType">Vehicle Type <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about this route (e.g., specific requirements, flexibility on dates, etc.)"
                  className="mt-1 min-h-[100px]"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="carrier" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  Post Route
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}