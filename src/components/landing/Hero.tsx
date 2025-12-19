import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Route } from 'lucide-react';
import heroIllustration from '@/assets/hero-illustration.png';

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
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium animate-fade-in">
              <Route className="h-4 w-4" />
              Direct Shipper-Carrier Matching
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight animate-slide-up">
              Connect Directly.{' '}
              <span className="text-primary">Ship Smarter.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
              FreightShare matches your loads directly with carriers on the right routes. 
              Secure payments, transparent pricing, no middlemen.
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

            <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.25s' }}>
              Already have an account?{' '}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>

            {/* Mobile Illustration */}
            <div className="lg:hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <img 
                src={heroIllustration} 
                alt="FreightShare platform showing carrier routes, trucks in motion, and pallets being matched onto existing routes with secure escrow" 
                className="w-full h-auto max-w-md mx-auto"
                loading="eager"
              />
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6 pt-6 lg:pt-8 border-t border-border animate-fade-in" style={{ animationDelay: '0.35s' }}>
              <div>
                <div className="text-base lg:text-lg font-heading font-bold text-foreground">Direct Matching</div>
                <div className="text-xs lg:text-sm text-muted-foreground">No brokers or middlemen</div>
              </div>
              <div>
                <div className="text-base lg:text-lg font-heading font-bold text-foreground">Secure Escrow</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Payment on delivery</div>
              </div>
              <div>
                <div className="text-base lg:text-lg font-heading font-bold text-foreground">Fair Pricing</div>
                <div className="text-xs lg:text-sm text-muted-foreground">You set the terms</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Illustration (Desktop Only) */}
          <div className="relative hidden lg:flex justify-center items-center">
            <img 
              src={heroIllustration} 
              alt="FreightShare platform showing carrier routes, trucks in motion, and pallets being matched onto existing routes with secure escrow" 
              className="w-full h-auto max-w-2xl animate-fade-in"
              style={{ animationDelay: '0.2s' }}
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
