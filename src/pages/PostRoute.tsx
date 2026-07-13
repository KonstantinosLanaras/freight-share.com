import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CityCombobox } from '@/components/CityCombobox';
import { countryNameFromCode, countryCodeToFlag } from '@/lib/countryCodes';
import { ArrowLeft, Truck, MapPin, Calendar, Plus, X, Package, Loader2, Info, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '@/lib/errorUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SpaceInput, type SpaceType } from '@/components/capacity';
import { calculateLdm } from '@/lib/capacityUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RouteStop {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  availablePallets: string;
  plannedDateTime: string;
}


const vehicleTypes = [
  { value: 'standard_truck', label: 'Standard Trailer (13.6m)' },
  { value: 'mega_trailer', label: 'Mega Trailer (15.65m)' },
  { value: 'jumbo_double_deck', label: 'Jumbo / Double Deck' },
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
  const { id: editId } = useParams();
  const isEditMode = !!editId;
  const [loadingExisting, setLoadingExisting] = useState(isEditMode);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spaceType, setSpaceType] = useState<SpaceType>('epe');
  const [spaceValue, setSpaceValue] = useState('');
  const [maxPayloadKg, setMaxPayloadKg] = useState('');
  const [maxDeviationKm, setMaxDeviationKm] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [routeLink, setRouteLink] = useState('');
  const [goodsAccepted, setGoodsAccepted] = useState('');
  const [itineraryFile, setItineraryFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    originCity: '',
    originCountry: '',
    originCountryCode: '',
    originLat: null as number | null,
    originLng: null as number | null,
    originPlannedDateTime: '',
    destinationCity: '',
    destinationCountry: '',
    destinationCountryCode: '',
    destinationLat: null as number | null,
    destinationLng: null as number | null,
    destinationPlannedDateTime: '',
    departureStart: '',
    departureTime: '',
    departureEnd: '',
    arrivalStart: '',
    arrivalEnd: '',
    vehicleType: '',
    openToExtraStops: false,
    flexibilityNote: '',
  });

  useEffect(() => {
    if (!isEditMode || !editId || !user) return;
    (async () => {
      const { data, error } = await supabase
        .from('routes')
        .select('*, route_stops(*)')
        .eq('id', editId)
        .single();
      if (error || !data) {
        toast.error('Failed to load route');
        navigate('/dashboard/carrier/routes');
        return;
      }
      if (data.carrier_id !== user.id) {
        toast.error('You cannot edit this route');
        navigate('/dashboard/carrier/routes');
        return;
      }
      const dep = data.departure_date_from && data.departure_time
        ? `${data.departure_date_from}T${String(data.departure_time).slice(0, 5)}`
        : data.departure_date_from ? `${data.departure_date_from}T00:00` : '';
      const arr = data.arrival_date_from && (data as any).arrival_time
        ? `${data.arrival_date_from}T${String((data as any).arrival_time).slice(0, 5)}`
        : data.arrival_date_from ? `${data.arrival_date_from}T00:00` : '';
      setFormData({
        originCity: data.origin_city || '',
        originCountry: data.origin_country || '',
        originCountryCode: '',
        originLat: data.origin_lat,
        originLng: data.origin_lng,
        originPlannedDateTime: dep,
        destinationCity: data.destination_city || '',
        destinationCountry: data.destination_country || '',
        destinationCountryCode: '',
        destinationLat: data.destination_lat,
        destinationLng: data.destination_lng,
        destinationPlannedDateTime: arr,
        departureStart: '',
        departureTime: '',
        departureEnd: '',
        arrivalStart: '',
        arrivalEnd: '',
        vehicleType: data.vehicle_type || '',
        openToExtraStops: !!data.open_to_extra_stops,
        flexibilityNote: data.flexibility_note || '',
      });
      setSpaceType((data.space_type as SpaceType) || 'epe');
      setSpaceValue(data.space_value ? String(data.space_value) : '');
      setMaxPayloadKg(data.max_payload_kg ? String(data.max_payload_kg) : '');
      setMaxDeviationKm(data.max_deviation_km ? String(data.max_deviation_km) : '');
      setTripDescription(data.trip_description || '');
      setRouteLink(data.route_link || '');
      setGoodsAccepted(data.goods_accepted || '');
      const existingStops = (data.route_stops || [])
        .sort((a: any, b: any) => a.stop_order - b.stop_order)
        .map((s: any) => ({
          id: s.id,
          city: s.city,
          country: s.country,
          countryCode: '',
          availablePallets: String(s.available_pallets ?? ''),
          plannedDateTime: s.planned_datetime ? new Date(s.planned_datetime).toISOString().slice(0, 16) : '',
        }));
      setStops(existingStops);
      setLoadingExisting(false);
    })();
  }, [isEditMode, editId, user, navigate]);

  const addStop = () => {
    setStops([
      ...stops,
      { id: crypto.randomUUID(), city: '', country: '', countryCode: '', availablePallets: '', plannedDateTime: '' }
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

  const updateStopCity = (id: string, city: { name: string; country: string }) => {
    setStops(stops.map(stop =>
      stop.id === id
        ? { ...stop, city: city.name, country: countryNameFromCode(city.country), countryCode: city.country }
        : stop
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to post a route');
      return;
    }

    if (!formData.originCity || !formData.destinationCity) {
      toast.error('Please select both origin and destination cities');
      return;
    }

    // Validate space input
    if (!spaceValue || parseFloat(spaceValue) <= 0) {
      toast.error('Please enter available space capacity');
      return;
    }

    // Validate payload
    if (!maxPayloadKg || parseFloat(maxPayloadKg) <= 0) {
      toast.error('Please enter maximum payload weight');
      return;
    }

    if (!formData.vehicleType) {
      toast.error('Please select a vehicle type');
      return;
    }

    // Schedule is derived from origin/destination planned datetimes below

    if (!formData.originPlannedDateTime) {
      toast.error('Please enter a planned departure date/time for origin');
      return;
    }

    if (!formData.destinationPlannedDateTime) {
      toast.error('Please enter a planned arrival date/time for destination');
      return;
    }

    // Validate stops have a city and planned datetime
    for (const stop of stops) {
      if (!stop.city) {
        toast.error('Please select a city for all stops');
        return;
      }
      if (!stop.plannedDateTime) {
        toast.error('Please enter planned date/time for all stops');
        return;
      }
    }


    setIsSubmitting(true);

    try {
      // Calculate LDM for internal storage
      const spaceLdm = calculateLdm(spaceType, parseFloat(spaceValue) || 0);

      // Upload itinerary image if provided
      let itineraryImageUrl: string | null = null;
      if (itineraryFile && user) {
        const ext = itineraryFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('itinerary-images').upload(path, itineraryFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('itinerary-images').getPublicUrl(path);
        itineraryImageUrl = urlData.publicUrl;
      }

      const routePayload: any = {
        origin_city: formData.originCity,
        origin_country: formData.originCountry,
        origin_lat: formData.originLat,
        origin_lng: formData.originLng,
        destination_city: formData.destinationCity,
        destination_country: formData.destinationCountry,
        destination_lat: formData.destinationLat,
        destination_lng: formData.destinationLng,
        departure_date_from: formData.originPlannedDateTime.split('T')[0],
        departure_date_to: formData.originPlannedDateTime.split('T')[0],
        departure_time: formData.originPlannedDateTime.split('T')[1] || null,
        arrival_date_from: formData.destinationPlannedDateTime.split('T')[0],
        arrival_date_to: formData.destinationPlannedDateTime.split('T')[0],
        arrival_time: formData.destinationPlannedDateTime.split('T')[1] || null,
        available_pallets: spaceType === 'epe' ? parseInt(spaceValue) || 0 : 0,
        vehicle_type: formData.vehicleType,
        vehicle_constraints: vehicleTypes.find(v => v.value === formData.vehicleType)?.label || null,
        open_to_extra_stops: formData.openToExtraStops,
        flexibility_note: formData.openToExtraStops ? formData.flexibilityNote.trim() : null,
        space_type: spaceType,
        space_value: parseFloat(spaceValue) || 0,
        space_ldm: spaceLdm,
        max_payload_kg: parseFloat(maxPayloadKg) || 0,
        max_deviation_km: maxDeviationKm ? parseFloat(maxDeviationKm) : null,
        trip_description: tripDescription || null,
        route_link: routeLink || null,
        goods_accepted: goodsAccepted || null,
      };
      if (itineraryImageUrl) routePayload.itinerary_image_url = itineraryImageUrl;

      let routeId = editId as string | undefined;
      if (isEditMode && editId) {
        const { error: updErr } = await supabase.from('routes').update(routePayload).eq('id', editId);
        if (updErr) throw updErr;
        // Reconcile stops: delete + reinsert
        await supabase.from('route_stops').delete().eq('route_id', editId);
      } else {
        const { data: routeData, error: routeError } = await supabase
          .from('routes')
          .insert({ ...routePayload, carrier_id: user.id, status: 'planned' })
          .select()
          .single();
        if (routeError) throw routeError;
        routeId = routeData.id;
      }

      if (routeId && stops.length > 0) {
        const stopsToInsert = stops.map((stop, index) => ({
          route_id: routeId!,
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

      toast.success(isEditMode ? 'Route updated' : 'Route posted successfully!');
      navigate(isEditMode && routeId ? `/dashboard/carrier/routes/${routeId}` : '/dashboard/carrier/routes');
    } catch (error: any) {
      console.error('Error posting route:', error);
      toast.error(getSafeErrorMessage(error, 'Failed to post route'));
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
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="originCity">City <span className="text-destructive">*</span></Label>
                  <CityCombobox
                    value={formData.originCity}
                    countryCode={formData.originCountryCode}
                    onSelect={(city) => setFormData({
                      ...formData,
                      originCity: city.name,
                      originCountry: countryNameFromCode(city.country),
                      originCountryCode: city.country,
                      originLat: city.lat,
                      originLng: city.lng,
                    })}
                    placeholder="e.g., Rotterdam"
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <div className="mt-1 flex h-10 items-center gap-2 rounded-md border border-input bg-muted/50 px-3 text-sm">
                    {formData.originCountryCode ? (
                      <>
                        <span className="text-lg">{countryCodeToFlag(formData.originCountryCode)}</span>
                        <span>{formData.originCountry}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Auto-detected from city</span>
                    )}
                  </div>
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
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>City <span className="text-destructive">*</span></Label>
                        <CityCombobox
                          value={stop.city}
                          countryCode={stop.countryCode}
                          onSelect={(city) => updateStopCity(stop.id, city)}
                          placeholder="e.g., Düsseldorf"
                          className="mt-1"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <div className="mt-1 flex h-10 items-center gap-2 rounded-md border border-input bg-muted/50 px-3 text-sm">
                          {stop.countryCode ? (
                            <>
                              <span className="text-lg">{countryCodeToFlag(stop.countryCode)}</span>
                              <span className="truncate">{stop.country}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Auto-detected</span>
                          )}
                        </div>
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
                  <CityCombobox
                    value={formData.destinationCity}
                    countryCode={formData.destinationCountryCode}
                    onSelect={(city) => setFormData({
                      ...formData,
                      destinationCity: city.name,
                      destinationCountry: countryNameFromCode(city.country),
                      destinationCountryCode: city.country,
                      destinationLat: city.lat,
                      destinationLng: city.lng,
                    })}
                    placeholder="e.g., Munich"
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <div className="mt-1 flex h-10 items-center gap-2 rounded-md border border-input bg-muted/50 px-3 text-sm">
                    {formData.destinationCountryCode ? (
                      <>
                        <span className="text-lg">{countryCodeToFlag(formData.destinationCountryCode)}</span>
                        <span>{formData.destinationCountry}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Auto-detected from city</span>
                    )}
                  </div>
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

          {/* Vehicle, Capacity & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-carrier" />
                Vehicle & Capacity
              </CardTitle>
              <CardDescription>Vehicle type is required for cargo matching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Label htmlFor="goodsAccepted">Goods Accepted</Label>
                <Input
                  id="goodsAccepted"
                  placeholder="e.g., General cargo, palletized, dry goods"
                  className="mt-1"
                  value={goodsAccepted}
                  onChange={(e) => setGoodsAccepted(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="pt-4 border-t">
                <SpaceInput
                  spaceType={spaceType}
                  spaceValue={spaceValue}
                  onSpaceTypeChange={setSpaceType}
                  onSpaceValueChange={setSpaceValue}
                  disabled={isSubmitting}
                  showDimensions={false}
                  label="How much space is available?"
                />
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Label htmlFor="maxPayload">
                    Maximum payload (kg) <span className="text-destructive">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Maximum additional weight you can carry</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="maxPayload"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g., 24000"
                  value={maxPayloadKg}
                  onChange={(e) => setMaxPayloadKg(e.target.value)}
                  disabled={isSubmitting}
                  className="mt-1"
                  required
                />
              </div>

            </CardContent>
          </Card>

          {/* Schedule is derived from Planned Departure / Planned Arrival above */}

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
                    Allow shippers to request alternative stops on this route
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Shippers can propose alternative pickup/dropoff points along your route
                  </p>
                </div>

              </div>

              {formData.openToExtraStops && (
                <>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="maxDeviation">Maximum deviation (km)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>How far you're willing to deviate from your planned route</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="maxDeviation"
                      type="number"
                      min="1"
                      placeholder="e.g., 50"
                      className="mt-1 max-w-[150px]"
                      value={maxDeviationKm}
                      onChange={(e) => setMaxDeviationKm(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="flexibilityNote">
                      Describe your flexibility
                    </Label>
                    <Textarea
                      id="flexibilityNote"
                      placeholder="e.g., Can deviate up to 50km from route, max 2 extra stops, flexible on timing within 2-hour windows..."
                      className="mt-1 min-h-[80px]"
                      value={formData.flexibilityNote}
                      onChange={(e) => setFormData({ ...formData, flexibilityNote: e.target.value })}
                      disabled={isSubmitting}
                      required={false}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>


          {/* Trip Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-carrier" />
                Trip Description
              </CardTitle>
              <CardDescription>Describe your trip so shippers understand your route and flexibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Vehicle details, capacity notes, route specifics, preferred cargo types, flexibility (stops, timing, deviations), loading/unloading requirements, delivery limitations, contact preferences, or any other relevant information..."
                className="min-h-[120px]"
                value={tripDescription}
                onChange={(e) => setTripDescription(e.target.value)}
                disabled={isSubmitting}
              />
              <div>
                <Label>Route / Itinerary Image (optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">Take a screenshot from Google Maps or your preferred route planner and upload it here.</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setItineraryFile(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label>Route Link (optional)</Label>
                <Input
                  placeholder="Paste a route-sharing link from Google Maps, etc."
                  className="mt-1"
                  value={routeLink}
                  onChange={(e) => setRouteLink(e.target.value)}
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
