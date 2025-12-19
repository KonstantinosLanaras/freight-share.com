import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Route } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* European map background - visible but subtle */}
      <div 
        className="absolute inset-0 opacity-[0.18] md:opacity-[0.25]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 700'%3E%3Cdefs%3E%3ClinearGradient id='fade' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2322c55e' stop-opacity='0.3'/%3E%3Cstop offset='50%25' stop-color='%2322c55e' stop-opacity='1'/%3E%3Cstop offset='100%25' stop-color='%2322c55e' stop-opacity='0.3'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg fill='none' stroke='url(%23fade)' stroke-width='1.5'%3E%3C!-- Europe outline shape --%3E%3Cpath d='M150,150 Q200,120 280,130 Q360,100 450,110 Q540,80 630,95 Q720,70 800,90 Q850,110 880,150' stroke-width='2'/%3E%3Cpath d='M120,200 Q180,170 270,185 Q360,155 450,170 Q540,140 630,155 Q720,125 800,145 Q860,165 900,200' stroke-width='1.8'/%3E%3Cpath d='M100,260 Q170,230 260,245 Q350,215 440,230 Q530,200 620,215 Q710,185 790,205 Q850,225 900,260' stroke-width='1.5'/%3E%3Cpath d='M90,320 Q160,290 250,305 Q340,275 430,290 Q520,260 610,275 Q700,245 780,265 Q840,285 890,320' stroke-width='1.3'/%3E%3Cpath d='M100,380 Q170,350 260,365 Q350,335 440,350 Q530,320 620,335 Q710,305 790,325 Q850,345 900,380' stroke-width='1.2'/%3E%3Cpath d='M120,440 Q190,410 280,425 Q370,395 460,410 Q550,380 640,395 Q730,365 810,385 Q870,405 910,440' stroke-width='1'/%3E%3Cpath d='M150,500 Q220,470 310,485 Q400,455 490,470 Q580,440 670,455 Q760,425 840,445 Q890,465 920,500' stroke-width='0.8'/%3E%3Cpath d='M180,550 Q250,525 340,540 Q430,510 520,525 Q610,495 700,510 Q790,480 860,500 Q900,520 930,550' stroke-width='0.6'/%3E%3C!-- Major city/hub points --%3E%3Ccircle cx='320' cy='180' r='6' fill='%2322c55e' opacity='0.7'/%3E%3Ccircle cx='480' cy='160' r='6' fill='%2322c55e' opacity='0.7'/%3E%3Ccircle cx='620' cy='150' r='6' fill='%2322c55e' opacity='0.7'/%3E%3Ccircle cx='760' cy='140' r='6' fill='%2322c55e' opacity='0.7'/%3E%3Ccircle cx='280' cy='260' r='5' fill='%2322c55e' opacity='0.6'/%3E%3Ccircle cx='420' cy='240' r='5' fill='%2322c55e' opacity='0.6'/%3E%3Ccircle cx='560' cy='225' r='5' fill='%2322c55e' opacity='0.6'/%3E%3Ccircle cx='700' cy='210' r='5' fill='%2322c55e' opacity='0.6'/%3E%3Ccircle cx='350' cy='340' r='4' fill='%2322c55e' opacity='0.5'/%3E%3Ccircle cx='500' cy='320' r='4' fill='%2322c55e' opacity='0.5'/%3E%3Ccircle cx='650' cy='300' r='4' fill='%2322c55e' opacity='0.5'/%3E%3Ccircle cx='380' cy='420' r='3' fill='%2322c55e' opacity='0.4'/%3E%3Ccircle cx='550' cy='400' r='3' fill='%2322c55e' opacity='0.4'/%3E%3C!-- Route connections --%3E%3Cpath d='M320,180 Q400,170 480,160' stroke-dasharray='6,4' stroke-width='1.5' opacity='0.6'/%3E%3Cpath d='M480,160 Q550,155 620,150' stroke-dasharray='6,4' stroke-width='1.5' opacity='0.6'/%3E%3Cpath d='M620,150 Q690,145 760,140' stroke-dasharray='6,4' stroke-width='1.5' opacity='0.6'/%3E%3Cpath d='M280,260 Q350,250 420,240' stroke-dasharray='5,4' stroke-width='1.2' opacity='0.5'/%3E%3Cpath d='M420,240 Q490,232 560,225' stroke-dasharray='5,4' stroke-width='1.2' opacity='0.5'/%3E%3Cpath d='M560,225 Q630,217 700,210' stroke-dasharray='5,4' stroke-width='1.2' opacity='0.5'/%3E%3Cpath d='M320,180 Q300,220 280,260' stroke-dasharray='4,4' stroke-width='1' opacity='0.4'/%3E%3Cpath d='M480,160 Q450,200 420,240' stroke-dasharray='4,4' stroke-width='1' opacity='0.4'/%3E%3Cpath d='M620,150 Q590,187 560,225' stroke-dasharray='4,4' stroke-width='1' opacity='0.4'/%3E%3Cpath d='M760,140 Q730,175 700,210' stroke-dasharray='4,4' stroke-width='1' opacity='0.4'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Soft gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="space-y-6 lg:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium animate-fade-in">
              <Route className="h-4 w-4" />
              Direct Shipper-Carrier Matching
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-foreground leading-tight animate-slide-up">
              Connect Directly.{' '}
              <span className="text-primary">Ship Smarter.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              FreightShare matches your loads directly with carriers on the right routes. 
              Secure payments, transparent pricing, no middlemen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
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
            <div className="grid grid-cols-3 gap-4 lg:gap-8 pt-8 lg:pt-12 border-t border-border max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
