import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Route } from 'lucide-react';
import heroIllustration from '@/assets/hero-illustration.png';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background with subtle map texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      
      {/* Subtle map/network pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cg fill='none' stroke='%2322c55e' stroke-width='1'%3E%3C!-- Europe-like landmass shape --%3E%3Cpath d='M50,120 Q80,100 120,110 T180,90 Q220,85 260,100 T320,95 Q350,110 380,120' /%3E%3Cpath d='M60,150 Q100,140 150,155 T220,145 Q270,140 310,160 T370,155' /%3E%3Cpath d='M40,180 Q90,170 140,185 T200,175 Q250,180 300,190 T360,185' /%3E%3Cpath d='M55,210 Q100,200 160,215 T230,205 Q280,210 330,220 T380,210' /%3E%3Cpath d='M45,240 Q95,235 145,250 T210,240 Q260,245 320,255 T375,245' /%3E%3Cpath d='M50,270 Q90,260 140,275 T200,265 Q250,270 310,280 T365,270' /%3E%3C!-- Route connection dots --%3E%3Ccircle cx='80' cy='130' r='3' fill='%2322c55e'/%3E%3Ccircle cx='150' cy='145' r='3' fill='%2322c55e'/%3E%3Ccircle cx='220' cy='120' r='3' fill='%2322c55e'/%3E%3Ccircle cx='290' cy='140' r='3' fill='%2322c55e'/%3E%3Ccircle cx='350' cy='125' r='3' fill='%2322c55e'/%3E%3Ccircle cx='100' cy='190' r='3' fill='%2322c55e'/%3E%3Ccircle cx='180' cy='175' r='3' fill='%2322c55e'/%3E%3Ccircle cx='260' cy='195' r='3' fill='%2322c55e'/%3E%3Ccircle cx='330' cy='180' r='3' fill='%2322c55e'/%3E%3Ccircle cx='120' cy='250' r='3' fill='%2322c55e'/%3E%3Ccircle cx='200' cy='235' r='3' fill='%2322c55e'/%3E%3Ccircle cx='280' cy='255' r='3' fill='%2322c55e'/%3E%3C!-- Dotted route lines --%3E%3Cpath d='M80,130 Q115,138 150,145' stroke-dasharray='4,4'/%3E%3Cpath d='M150,145 Q185,132 220,120' stroke-dasharray='4,4'/%3E%3Cpath d='M220,120 Q255,130 290,140' stroke-dasharray='4,4'/%3E%3Cpath d='M100,190 Q140,182 180,175' stroke-dasharray='4,4'/%3E%3Cpath d='M180,175 Q220,185 260,195' stroke-dasharray='4,4'/%3E%3Cpath d='M120,250 Q160,242 200,235' stroke-dasharray='4,4'/%3E%3Cpath d='M200,235 Q240,245 280,255' stroke-dasharray='4,4'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '600px 600px'
        }}
      />
      
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
