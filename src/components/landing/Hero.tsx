import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Route } from 'lucide-react';
import heroIllustration from '@/assets/hero-illustration.png';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background with subtle map texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      
      {/* Hero Illustration - positioned absolutely on the right */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[55%] h-full hidden lg:flex items-center justify-end pointer-events-none">
        <img 
          src={heroIllustration} 
          alt="FreightShare platform showing carrier routes, trucks in motion, and pallets being matched onto existing routes with secure escrow" 
          className="w-full h-auto max-w-[800px] object-contain animate-fade-in"
          style={{ animationDelay: '0.2s' }}
          loading="eager"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-xl lg:max-w-2xl">
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
                <Link to="/auth?role=shipper">
                  Ship a Load
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" asChild>
                <Link to="/auth?role=carrier">
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
        </div>
      </div>
    </section>
  );
};
