import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Truck,
  ArrowRight,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  MapPin,
  Euro
} from 'lucide-react';

// Mock data for demo
const mockRoutes = [
  {
    id: '1',
    origin: 'Rotterdam, NL',
    destination: 'Frankfurt, DE',
    stops: ['Düsseldorf, DE'],
    capacity: 18,
    departure: 'Dec 19-20',
    matches: 4,
  },
  {
    id: '2',
    origin: 'Amsterdam, NL',
    destination: 'Milan, IT',
    stops: ['Brussels, BE', 'Lyon, FR'],
    capacity: 24,
    departure: 'Dec 21-22',
    matches: 7,
  },
];

const mockAvailableLoads = [
  {
    id: '1',
    origin: 'Rotterdam, NL',
    destination: 'Munich, DE',
    pallets: 12,
    price: 850,
    pickupDate: 'Dec 20-22',
    shipper: 'Acme Corp',
    rating: 4.8,
  },
  {
    id: '2',
    origin: 'Amsterdam, NL',
    destination: 'Paris, FR',
    pallets: 8,
    price: 620,
    pickupDate: 'Dec 18-19',
    shipper: 'Global Trade Ltd',
    rating: 4.5,
  },
  {
    id: '3',
    origin: 'Brussels, BE',
    destination: 'Frankfurt, DE',
    pallets: 6,
    price: 450,
    pickupDate: 'Dec 19',
    shipper: 'EuroShip GmbH',
    rating: 4.9,
  },
];

export default function CarrierDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold">FreightShare</span>
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <Truck className="h-8 w-8 text-sidebar-primary" />
                <Package className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
              </div>
              <span className="font-heading font-bold text-lg text-sidebar-foreground">
                Freight<span className="text-accent">Share</span>
              </span>
            </Link>
            <button 
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Badge */}
          <div className="px-6 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-carrier/20 rounded-full text-carrier-foreground text-sm">
              <Truck className="h-4 w-4" />
              Carrier
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <Link 
              to="/dashboard/carrier"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <TrendingUp className="h-5 w-5" />
              Dashboard
            </Link>
            <Link 
              to="/dashboard/carrier/routes"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <MapPin className="h-5 w-5" />
              My Routes
            </Link>
            <Link 
              to="/dashboard/carrier/loads"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Package className="h-5 w-5" />
              Find Loads
            </Link>
            <Link 
              to="/dashboard/carrier/shipments"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Truck className="h-5 w-5" />
              Shipments
            </Link>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-5 w-5 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">Transport Co</div>
                <div className="text-xs text-sidebar-foreground/60 truncate">carrier@example.com</div>
              </div>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">
                Welcome back! 🚚
              </h1>
              <p className="text-muted-foreground mt-1">
                Find loads that match your routes and grow your business.
              </p>
            </div>
            <Button variant="carrier" asChild>
              <Link to="/dashboard/carrier/routes/new">
                <Plus className="h-4 w-4" />
                Post New Route
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-carrier/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-carrier" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">2</div>
                    <div className="text-sm text-muted-foreground">Active Routes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">11</div>
                    <div className="text-sm text-muted-foreground">Matched Loads</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">24</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Euro className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">€15.2k</div>
                    <div className="text-sm text-muted-foreground">Total Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* My Routes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Routes</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/carrier/routes">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRoutes.map((route) => (
                    <div 
                      key={route.id}
                      className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-foreground">
                          {route.origin} → {route.destination}
                        </div>
                        <Badge variant="secondary">
                          {route.matches} matches
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {route.stops.length > 0 && (
                          <span>via {route.stops.join(', ')} · </span>
                        )}
                        {route.capacity} pallets · {route.departure}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Available Loads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Available Loads</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/carrier/loads">
                    Browse All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAvailableLoads.map((load) => (
                    <div 
                      key={load.id}
                      className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-foreground">
                            {load.origin} → {load.destination}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {load.pallets} pallets · {load.pickupDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">€{load.price}</div>
                          <div className="text-xs text-muted-foreground">
                            {load.shipper} · {load.rating}★
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        Make Offer
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
