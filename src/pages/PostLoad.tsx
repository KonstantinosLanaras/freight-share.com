import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CityCombobox } from '@/components/CityCombobox';
import { countryNameFromCode, countryCodeToFlag } from '@/lib/countryCodes';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Package, MapPin, Calendar, Euro, FileText, Loader2, Scale, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '@/lib/errorUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SpaceInput, WeightInput, type SpaceType } from '@/components/capacity';
import { calculateLdm } from '@/lib/capacityUtils';

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


export default function PostLoad() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: editId } = useParams();
  const isEditMode = !!editId;
  const [loadingExisting, setLoadingExisting] = useState(isEditMode);
  const [pricingMode, setPricingMode] = useState<'fixed' | 'guided' | 'open'>('fixed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickupSameDay, setPickupSameDay] = useState(false);
  const [deliverySameDay, setDeliverySameDay] = useState(false);
  const [spaceType, setSpaceType] = useState<SpaceType>('epe');
  const [spaceValue, setSpaceValue] = useState('');
  const [dimensions, setDimensions] = useState({ lengthCm: '', widthCm: '', heightCm: '' });
  const [weightKg, setWeightKg] = useState('');
  const [formData, setFormData] = useState({
    originCity: '',
    originCountry: '',
    originCountryCode: '',
    originLat: null as number | null,
    originLng: null as number | null,
    destinationCity: '',
    destinationCountry: '',
    destinationCountryCode: '',
    destinationLat: null as number | null,
    destinationLng: null as number | null,
    pickupDateStart: '',
    pickupDateEnd: '',
    pickupTimeFrom: '',
    pickupTimeTo: '',
    pickupFlexibility: 'flexible' as 'flexible' | 'window' | 'exact',
    deliveryDateStart: '',
    deliveryDateEnd: '',
    deliveryTimeFrom: '',
    deliveryTimeTo: '',
    deliveryFlexibility: 'flexible' as 'flexible' | 'window' | 'exact',
    pallets: '',
    cargoType: 'general',
    fixedPrice: '',
    notes: '',
    cargoNotes: '',
  });

  useEffect(() => {
    if (!isEditMode || !editId || !user) return;
    (async () => {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('id', editId)
        .single();
      if (error || !data) {
        toast.error('Failed to load');
        navigate('/dashboard/shipper/loads');
        return;
      }
      if (data.shipper_id !== user.id) {
        toast.error('You cannot edit this load');
        navigate('/dashboard/shipper/loads');
        return;
      }
      setFormData({
        originCity: data.origin_city || '',
        originCountry: data.origin_country || '',
        originCountryCode: '',
        originLat: data.origin_lat,
        originLng: data.origin_lng,
        destinationCity: data.destination_city || '',
        destinationCountry: data.destination_country || '',
        destinationCountryCode: '',
        destinationLat: data.destination_lat,
        destinationLng: data.destination_lng,
        pickupDateStart: data.pickup_date_from || '',
        pickupDateEnd: data.pickup_date_to || '',
        pickupTimeFrom: (data as any).pickup_time_from || '',
        pickupTimeTo: (data as any).pickup_time_to || '',
        pickupFlexibility: ((data as any).pickup_flexibility || 'flexible') as 'flexible' | 'window' | 'exact',
        deliveryDateStart: data.delivery_date_from || '',
        deliveryDateEnd: data.delivery_date_to || '',
        deliveryTimeFrom: (data as any).delivery_time_from || '',
        deliveryTimeTo: (data as any).delivery_time_to || '',
        deliveryFlexibility: ((data as any).delivery_flexibility || 'flexible') as 'flexible' | 'window' | 'exact',
        pallets: String(data.pallets || ''),
        cargoType: data.cargo_type || 'general',
        fixedPrice: data.price ? String(data.price) : '',
        notes: data.notes || '',
        cargoNotes: data.cargo_notes || '',
      });
      setPricingMode(
        data.pricing_type === 'open_to_offers'
          ? (data.price ? 'guided' : 'open')
          : 'fixed'
      );
      setSpaceType((data.space_type as SpaceType) || 'epe');
      setSpaceValue(data.space_value ? String(data.space_value) : '');
      setDimensions({
        lengthCm: data.length_cm ? String(data.length_cm) : '',
        widthCm: data.width_cm ? String(data.width_cm) : '',
        heightCm: data.height_cm ? String(data.height_cm) : '',
      });
      setWeightKg(data.weight_kg ? String(data.weight_kg) : '');
      if (data.pickup_date_from && data.pickup_date_to && data.pickup_date_from === data.pickup_date_to) {
        setPickupSameDay(true);
      }
      if (data.delivery_date_from && data.delivery_date_to && data.delivery_date_from === data.delivery_date_to) {
        setDeliverySameDay(true);
      }
      setLoadingExisting(false);
    })();
  }, [isEditMode, editId, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to post a load');
      return;
    }

    if (!formData.originCity || !formData.destinationCity) {
      toast.error('Please select both origin and destination cities');
      return;
    }

    // Validate space input
    if (spaceType === 'dimensions') {
      if (!dimensions.lengthCm || !dimensions.widthCm) {
        toast.error('Please enter cargo dimensions (length and width are required)');
        return;
      }
    } else {
      if (!spaceValue || parseFloat(spaceValue) <= 0) {
        toast.error('Please enter required space');
        return;
      }
    }

    // Validate weight
    if (!weightKg || parseFloat(weightKg) <= 0) {
      toast.error('Please enter total weight');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate LDM for internal storage
      const spaceLdm = calculateLdm(
        spaceType,
        parseFloat(spaceValue) || 0,
        spaceType === 'dimensions' ? {
          lengthCm: parseFloat(dimensions.lengthCm) || 0,
          widthCm: parseFloat(dimensions.widthCm) || 0,
        } : undefined
      );

      // Ensure same-day selections store identical start/end dates
      if (pickupSameDay) formData.pickupDateEnd = formData.pickupDateStart;
      if (deliverySameDay) formData.deliveryDateEnd = formData.deliveryDateStart;

      const payload = {
        origin_city: formData.originCity,
        origin_country: formData.originCountry,
        origin_lat: formData.originLat,
        origin_lng: formData.originLng,
        destination_city: formData.destinationCity,
        destination_country: formData.destinationCountry,
        destination_lat: formData.destinationLat,
        destination_lng: formData.destinationLng,
        pickup_date_from: formData.pickupDateStart,
        pickup_date_to: formData.pickupDateEnd,
        ...(formData.pickupFlexibility !== 'flexible' && formData.pickupTimeFrom ? { pickup_time_from: formData.pickupTimeFrom } : {}),
        ...(formData.pickupFlexibility !== 'flexible' && formData.pickupTimeTo ? { pickup_time_to: formData.pickupTimeTo } : {}),
        pickup_flexibility: formData.pickupFlexibility,
        delivery_date_from: formData.deliveryDateStart,
        delivery_date_to: formData.deliveryDateEnd,
        ...(formData.deliveryFlexibility !== 'flexible' && formData.deliveryTimeFrom ? { delivery_time_from: formData.deliveryTimeFrom } : {}),
        ...(formData.deliveryFlexibility !== 'flexible' && formData.deliveryTimeTo ? { delivery_time_to: formData.deliveryTimeTo } : {}),
        delivery_flexibility: formData.deliveryFlexibility,
        pallets: spaceType === 'epe' ? parseInt(spaceValue) || 0 : 0,
        cargo_type: formData.cargoType as any,
        pricing_type: (pricingMode === 'fixed' ? 'fixed' : 'open_to_offers') as any,
        price: pricingMode === 'open' ? null : parseFloat(formData.fixedPrice) || null,
        notes: formData.notes || null,
        space_type: spaceType,
        space_value: parseFloat(spaceValue) || 0,
        space_ldm: spaceLdm,
        weight_kg: parseFloat(weightKg) || 0,
        length_cm: spaceType === 'dimensions' ? parseFloat(dimensions.lengthCm) || null : null,
        width_cm: spaceType === 'dimensions' ? parseFloat(dimensions.widthCm) || null : null,
        height_cm: spaceType === 'dimensions' ? parseFloat(dimensions.heightCm) || null : null,
        cargo_notes: formData.cargoNotes || null,
      };

      if (isEditMode && editId) {
        const { error } = await supabase.from('loads').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('Load updated');
        navigate(`/load/${editId}`);
      } else {
        const { error } = await supabase.from('loads').insert({ ...payload, shipper_id: user.id });
        if (error) throw error;
        toast.success('Load posted successfully!');
        navigate('/dashboard/shipper');
      }
    } catch (error: any) {
      console.error('Error posting load:', error);
      toast.error(getSafeErrorMessage(error, 'Failed to post load'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <h1 className="text-xl font-heading font-bold text-foreground">{isEditMode ? 'Edit Load' : 'Post a New Load'}</h1>
              <p className="text-sm text-muted-foreground">{isEditMode ? 'Update the load details' : 'Fill in the details to find carriers'}</p>
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
                  <Label>Origin Country</Label>
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
              </div>

              {/* Destination */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destinationCity">Destination City</Label>
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
                  <Label>Destination Country</Label>
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
              </div>
            </CardContent>
          </Card>

          {/* Dates & Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Scheduling
              </CardTitle>
              <CardDescription>Set your pickup and delivery windows, including time of day and flexibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pickup */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Pickup</p>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pickupSameDay"
                    checked={pickupSameDay}
                    onCheckedChange={(checked) => {
                      setPickupSameDay(checked === true);
                      if (checked && formData.pickupDateStart) {
                        setFormData({ ...formData, pickupDateEnd: formData.pickupDateStart });
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="pickupSameDay" className="text-sm text-muted-foreground cursor-pointer select-none">
                    Same day pickup (exact date)
                  </label>
                </div>
                {pickupSameDay ? (
                  <>
                    <div>
                      <Label htmlFor="pickupDateStart">Pickup date <span className="text-destructive">*</span></Label>
                      <Input id="pickupDateStart" type="date" className="mt-1" value={formData.pickupDateStart}
                        onChange={(e) => setFormData({ ...formData, pickupDateStart: e.target.value, pickupDateEnd: e.target.value })}
                        required disabled={isSubmitting} />
                    </div>
                    <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        This exact date is recorded on the shipment. Both parties are accountable to it. If scheduling changes, agree an alternative via private messages.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickupDateStart">Earliest date</Label>
                      <Input id="pickupDateStart" type="date" className="mt-1" value={formData.pickupDateStart}
                        onChange={(e) => setFormData({ ...formData, pickupDateStart: e.target.value })} required disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label htmlFor="pickupDateEnd">Latest date</Label>
                      <Input id="pickupDateEnd" type="date" className="mt-1" value={formData.pickupDateEnd}
                        onChange={(e) => setFormData({ ...formData, pickupDateEnd: e.target.value })} required disabled={isSubmitting} />
                    </div>
                  </div>
                )}
                <div>
                  <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Time flexibility</Label>
                  <Select value={formData.pickupFlexibility} onValueChange={(v) => setFormData({ ...formData, pickupFlexibility: v as any })} disabled={isSubmitting}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible — any time of day</SelectItem>
                      <SelectItem value="window">Specific time window</SelectItem>
                      <SelectItem value="exact">Exact time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.pickupFlexibility === 'window' && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickupTimeFrom">Window opens</Label>
                      <Input id="pickupTimeFrom" type="time" className="mt-1" value={formData.pickupTimeFrom}
                        onChange={(e) => setFormData({ ...formData, pickupTimeFrom: e.target.value })} disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label htmlFor="pickupTimeTo">Window closes</Label>
                      <Input id="pickupTimeTo" type="time" className="mt-1" value={formData.pickupTimeTo}
                        onChange={(e) => setFormData({ ...formData, pickupTimeTo: e.target.value })} disabled={isSubmitting} />
                    </div>
                  </div>
                )}
                {formData.pickupFlexibility === 'exact' && (
                  <>
                    <div>
                      <Label htmlFor="pickupTimeFrom">Exact pickup time</Label>
                      <Input id="pickupTimeFrom" type="time" className="mt-1 max-w-[160px]" value={formData.pickupTimeFrom}
                        onChange={(e) => setFormData({ ...formData, pickupTimeFrom: e.target.value })} disabled={isSubmitting} />
                    </div>
                    <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        This exact time is recorded on the shipment. Both parties are accountable to it. If scheduling changes, agree an alternative via private messages.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-border" />

              {/* Delivery */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Delivery</p>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="deliverySameDay"
                    checked={deliverySameDay}
                    onCheckedChange={(checked) => {
                      setDeliverySameDay(checked === true);
                      if (checked && formData.deliveryDateStart) {
                        setFormData({ ...formData, deliveryDateEnd: formData.deliveryDateStart });
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="deliverySameDay" className="text-sm text-muted-foreground cursor-pointer select-none">
                    Same day delivery (exact date)
                  </label>
                </div>
                {deliverySameDay ? (
                  <>
                    <div>
                      <Label htmlFor="deliveryDateStart">Delivery date <span className="text-destructive">*</span></Label>
                      <Input id="deliveryDateStart" type="date" className="mt-1" value={formData.deliveryDateStart}
                        onChange={(e) => setFormData({ ...formData, deliveryDateStart: e.target.value, deliveryDateEnd: e.target.value })}
                        required disabled={isSubmitting} />
                    </div>
                    <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        This exact date is recorded on the shipment. Both parties are accountable to it. If scheduling changes, agree an alternative via private messages.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deliveryDateStart">Earliest date</Label>
                      <Input id="deliveryDateStart" type="date" className="mt-1" value={formData.deliveryDateStart}
                        onChange={(e) => setFormData({ ...formData, deliveryDateStart: e.target.value })} required disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label htmlFor="deliveryDateEnd">Latest date</Label>
                      <Input id="deliveryDateEnd" type="date" className="mt-1" value={formData.deliveryDateEnd}
                        onChange={(e) => setFormData({ ...formData, deliveryDateEnd: e.target.value })} required disabled={isSubmitting} />
                    </div>
                  </div>
                )}
                <div>
                  <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Time flexibility</Label>
                  <Select value={formData.deliveryFlexibility} onValueChange={(v) => setFormData({ ...formData, deliveryFlexibility: v as any })} disabled={isSubmitting}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible — any time of day</SelectItem>
                      <SelectItem value="window">Specific time window</SelectItem>
                      <SelectItem value="exact">Exact time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.deliveryFlexibility === 'window' && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deliveryTimeFrom">Window opens</Label>
                      <Input id="deliveryTimeFrom" type="time" className="mt-1" value={formData.deliveryTimeFrom}
                        onChange={(e) => setFormData({ ...formData, deliveryTimeFrom: e.target.value })} disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label htmlFor="deliveryTimeTo">Window closes</Label>
                      <Input id="deliveryTimeTo" type="time" className="mt-1" value={formData.deliveryTimeTo}
                        onChange={(e) => setFormData({ ...formData, deliveryTimeTo: e.target.value })} disabled={isSubmitting} />
                    </div>
                  </div>
                )}
                {formData.deliveryFlexibility === 'exact' && (
                  <>
                    <div>
                      <Label htmlFor="deliveryTimeFrom">Exact delivery time</Label>
                      <Input id="deliveryTimeFrom" type="time" className="mt-1 max-w-[160px]" value={formData.deliveryTimeFrom}
                        onChange={(e) => setFormData({ ...formData, deliveryTimeFrom: e.target.value })} disabled={isSubmitting} />
                    </div>
                    <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        This exact time is recorded on the shipment. Both parties are accountable to it. If scheduling changes, agree an alternative via private messages.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Capacity - Space & Weight */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Capacity Requirements
              </CardTitle>
              <CardDescription>Specify space and weight for your shipment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SpaceInput
                spaceType={spaceType}
                spaceValue={spaceValue}
                lengthCm={dimensions.lengthCm}
                widthCm={dimensions.widthCm}
                heightCm={dimensions.heightCm}
                onSpaceTypeChange={setSpaceType}
                onSpaceValueChange={setSpaceValue}
                onDimensionsChange={setDimensions}
                disabled={isSubmitting}
                showDimensions={true}
              />
              
              <div className="pt-4 border-t">
                <WeightInput
                  value={weightKg}
                  onChange={setWeightKg}
                  disabled={isSubmitting}
                  required={true}
                />
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
              
              <div>
                <Label htmlFor="cargoNotes">Cargo Notes (optional)</Label>
                <Textarea
                  id="cargoNotes"
                  placeholder="e.g., Stackable, fragile items, irregular shape, requires special handling..."
                  rows={2}
                  value={formData.cargoNotes}
                  onChange={(e) => setFormData({ ...formData, cargoNotes: e.target.value })}
                  disabled={isSubmitting}
                  className="mt-1"
                />
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
              <div className="grid gap-3">
                {[
                  {
                    key: 'fixed' as const,
                    title: 'Fixed price',
                    desc: 'Set a firm price. Carriers accept as-is.',
                  },
                  {
                    key: 'guided' as const,
                    title: 'Target price, open to offers',
                    desc: 'Suggest a price but let carriers propose their own.',
                  },
                  {
                    key: 'open' as const,
                    title: 'Open to offers',
                    desc: 'No price shown — carriers propose their own.',
                  },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPricingMode(opt.key)}
                    disabled={isSubmitting}
                    className={`text-left p-4 rounded-lg border transition-colors ${
                      pricingMode === opt.key
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-medium text-foreground">{opt.title}</div>
                    <div className="text-sm text-muted-foreground">{opt.desc}</div>
                  </button>
                ))}
              </div>

              {pricingMode !== 'open' && (
                <div>
                  <Label htmlFor="fixedPrice">
                    {pricingMode === 'fixed' ? 'Fixed Price (€)' : 'Target Price (€)'}
                  </Label>
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
                  {pricingMode === 'guided' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Carriers will see this as a guide price and can still submit offers.
                    </p>
                  )}
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
                placeholder="e.g., Loading dock available, forklift required, specific timing requirements..."
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
                  {isEditMode ? 'Saving...' : 'Posting...'}
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Post Load'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
