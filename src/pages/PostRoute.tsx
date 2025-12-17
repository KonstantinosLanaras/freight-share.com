import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Truck, MapPin, Calendar, Plus, X, Package } from 'lucide-react';
import { toast } from 'sonner';

interface RouteStop {
  id: string;
  city: string;
  country: string;
  availablePallets: string;
}

const countries = [
  'Netherlands', 'Germany', 'France', 'Belgium', 'Italy', 'Spain', 
  'Poland', 'Austria', 'Switzerland', 'Czech Republic', 'Denmark', 'Sweden'
];

export default function PostRoute() {
  const navigate = useNavigate();
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [formData, setFormData] = useState({
    originCity: '',
    originCountry: '',
    originPallets: '',
    destinationCity: '',
    destinationCountry: '',
    departureStart: '',
    departureEnd: '',
  });

  const addStop = () => {
    setStops([
      ...stops,
      { id: crypto.randomUUID(), city: '', country: '', availablePallets: '' }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Backend integration required. Enable Lovable Cloud to save routes.');
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
                  <Label htmlFor="originCity">City</Label>
                  <Input
                    id="originCity"
                    placeholder="e.g., Rotterdam"
                    className="mt-1"
                    value={formData.originCity}
                    onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="originCountry">Country</Label>
                  <Select
                    value={formData.originCountry}
                    onValueChange={(value) => setFormData({ ...formData, originCountry: value })}
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
                  <Label htmlFor="originPallets">Available Pallets</Label>
                  <Input
                    id="originPallets"
                    type="number"
                    min="1"
                    placeholder="e.g., 24"
                    className="mt-1"
                    value={formData.originPallets}
                    onChange={(e) => setFormData({ ...formData, originPallets: e.target.value })}
                    required
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
                <CardDescription>Cities where you can load or unload cargo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="relative p-4 rounded-lg bg-muted/50">
                    <button
                      type="button"
                      onClick={() => removeStop(stop.id)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="text-sm font-medium text-muted-foreground mb-3">Stop {index + 1}</div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input
                          placeholder="e.g., Düsseldorf"
                          className="mt-1"
                          value={stop.city}
                          onChange={(e) => updateStop(stop.id, 'city', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Select
                          value={stop.country}
                          onValueChange={(value) => updateStop(stop.id, 'country', value)}
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
                        <Label>Available Pallets</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g., 18"
                          className="mt-1"
                          value={stop.availablePallets}
                          onChange={(e) => updateStop(stop.id, 'availablePallets', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Button type="button" variant="outline" className="w-full" onClick={addStop}>
            <Plus className="h-4 w-4" />
            Add Stop
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
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destinationCity">City</Label>
                  <Input
                    id="destinationCity"
                    placeholder="e.g., Munich"
                    className="mt-1"
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="destinationCountry">Country</Label>
                  <Select
                    value={formData.destinationCountry}
                    onValueChange={(value) => setFormData({ ...formData, destinationCountry: value })}
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
                <Calendar className="h-5 w-5 text-carrier" />
                Departure Window
              </CardTitle>
              <CardDescription>When are you planning to depart?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departureStart">Earliest Departure</Label>
                  <Input
                    id="departureStart"
                    type="date"
                    className="mt-1"
                    value={formData.departureStart}
                    onChange={(e) => setFormData({ ...formData, departureStart: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="departureEnd">Latest Departure</Label>
                  <Input
                    id="departureEnd"
                    type="date"
                    className="mt-1"
                    value={formData.departureEnd}
                    onChange={(e) => setFormData({ ...formData, departureEnd: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="carrier" className="flex-1">
              <Truck className="h-4 w-4" />
              Post Route
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
