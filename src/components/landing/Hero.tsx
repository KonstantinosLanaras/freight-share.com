import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Route } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Base background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/10" />
      
      {/* Subtle European map background - watermark style */}
      <div 
        className="absolute inset-0 opacity-[0.035] md:opacity-[0.045]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cg fill='none' stroke='%2322c55e' stroke-width='0.8'%3E%3C!-- Simplified Europe landmass outline --%3E%3Cpath d='M180,80 Q220,60 280,70 Q340,55 400,65 Q460,50 520,60 Q580,45 640,55 Q680,70 720,90' stroke-width='1.2'/%3E%3Cpath d='M150,120 Q200,100 260,115 Q320,95 380,110 Q440,90 500,105 Q560,85 620,100 Q680,110 740,130' stroke-width='1'/%3E%3Cpath d='M120,170 Q180,150 240,165 Q300,145 360,160 Q420,140 480,155 Q540,135 600,150 Q660,160 720,180' stroke-width='1'/%3E%3Cpath d='M100,220 Q160,200 220,215 Q280,195 340,210 Q400,190 460,205 Q520,185 580,200 Q640,210 700,230' stroke-width='0.8'/%3E%3Cpath d='M90,270 Q150,250 210,265 Q270,245 330,260 Q390,240 450,255 Q510,235 570,250 Q630,260 690,280' stroke-width='0.8'/%3E%3Cpath d='M80,320 Q140,300 200,315 Q260,295 320,310 Q380,290 440,305 Q500,285 560,300 Q620,310 680,330' stroke-width='0.6'/%3E%3Cpath d='M100,370 Q160,350 220,365 Q280,345 340,360 Q400,340 460,355 Q520,335 580,350 Q640,360 700,380' stroke-width='0.6'/%3E%3Cpath d='M130,420 Q190,400 250,415 Q310,395 370,410 Q430,390 490,405 Q550,385 610,400 Q670,410 720,430' stroke-width='0.5'/%3E%3C!-- Subtle connection points --%3E%3Ccircle cx='280' cy='115' r='2.5' fill='%2322c55e' opacity='0.6'/%3E%3Ccircle cx='400' cy='105' r='2.5' fill='%2322c55e' opacity='0.6'/%3E%3Ccircle cx='520' cy='100' r='2.5' fill='%2322c55e' opacity='0.6'/%3E%3Ccircle cx='640' cy='95' r='2.5' fill='%2322c55e' opacity='0.6'/%3E%3Ccircle cx='240' cy='165' r='2' fill='%2322c55e' opacity='0.5'/%3E%3Ccircle cx='360' cy='155' r='2' fill='%2322c55e' opacity='0.5'/%3E%3Ccircle cx='480' cy='150' r='2' fill='%2322c55e' opacity='0.5'/%3E%3Ccircle cx='600' cy='145' r='2' fill='%2322c55e' opacity='0.5'/%3E%3Ccircle cx='320' cy='260' r='2' fill='%2322c55e' opacity='0.4'/%3E%3Ccircle cx='450' cy='250' r='2' fill='%2322c55e' opacity='0.4'/%3E%3Ccircle cx='570' cy='245' r='2' fill='%2322c55e' opacity='0.4'/%3E%3C!-- Faint dotted route connections --%3E%3Cpath d='M280,115 Q340,110 400,105' stroke-dasharray='3,5' opacity='0.5'/%3E%3Cpath d='M400,105 Q460,102 520,100' stroke-dasharray='3,5' opacity='0.5'/%3E%3Cpath d='M520,100 Q580,97 640,95' stroke-dasharray='3,5' opacity='0.5'/%3E%3Cpath d='M240,165 Q300,160 360,155' stroke-dasharray='3,5' opacity='0.4'/%3E%3Cpath d='M360,155 Q420,152 480,150' stroke-dasharray='3,5' opacity='0.4'/%3E%3Cpath d='M480,150 Q540,147 600,145' stroke-dasharray='3,5' opacity='0.4'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100% auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Fade edges for seamless blend */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/80" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
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

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6 pt-6 lg:pt-8 border-t border-border animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
