import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium animate-fade-in">
              <Shield className="h-4 w-4" />
              Trusted by 500+ companies across Europe
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight animate-slide-up">
              The Trusted{' '}
              <span className="text-primary">Third Party</span>{' '}
              for Freight
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
              FreightShare connects shippers with carriers through secure payments and transparent transactions. 
              We handle the trust, so you can focus on moving freight.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button variant="hero" asChild>
                <Link to="/auth?mode=signup&role=shipper">
                  Ship a Load
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" asChild>
                <Link to="/auth?mode=signup&role=carrier">
                  Find Loads as Carrier
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div>
                <div className="text-2xl md:text-3xl font-heading font-bold text-foreground">€2.5M+</div>
                <div className="text-sm text-muted-foreground">Transactions Secured</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-heading font-bold text-foreground">1,200+</div>
                <div className="text-sm text-muted-foreground">Shipments Delivered</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-heading font-bold text-foreground">4.9★</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main Card */}
              <div className="bg-card rounded-2xl shadow-xl border border-border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">New Load Posted</div>
                    <div className="text-sm text-muted-foreground">Rotterdam → Munich</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pallets</span>
                    <span className="font-medium">12 pallets</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pickup</span>
                    <span className="font-medium">Dec 20-22</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold text-primary">€850</span>
                  </div>
                </div>
                <Button variant="accent" className="w-full mt-4">Make Offer</Button>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-card rounded-xl shadow-lg border border-border p-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Payment Secured</div>
                    <div className="text-xs text-muted-foreground">Protected by FreightShare</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg border border-border p-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-accent" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">3 Carriers Matched</div>
                    <div className="text-xs text-muted-foreground">Best routes available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
