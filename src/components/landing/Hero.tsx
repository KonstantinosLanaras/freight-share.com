import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Route, Search, Warehouse, Truck } from 'lucide-react';
import heroMapBackground from '@/assets/hero-map-background.png';

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center pt-28 sm:pt-24 md:pt-16 overflow-hidden">
      {/* European map background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroMapBackground})` }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Vertical buffer for breathing room below header */}
          <div className="pt-4 md:pt-6 lg:pt-8">
            <div className="space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium animate-fade-in">
                <Route className="h-4 w-4" />
                {t('hero.tagline')}
              </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-foreground leading-tight animate-slide-up">
              {t('hero.title')}{' '}
              <span className="text-primary">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button variant="hero" asChild>
                <Link to="/select-role">
                  {t('hero.exploreBeta')}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" asChild>
                <Link to="/auth?role=carrier">
                  <Search className="h-5 w-5 mr-1" />
                  {t('hero.browseLoads')}
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <a
                href="#early-access"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('early-access')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-primary hover:underline font-medium"
              >
                Get Early Access
              </a>
              <span className="mx-2 text-muted-foreground/60">·</span>
              <Link to="/select-role" className="text-primary hover:underline font-medium">
                Explore the Beta
              </Link>
            </p>

            {/* Role Selection Cards - BlaBlaCar Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 lg:pt-14 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {/* Shipper Card */}
              <Link 
                to="/auth?role=shipper"
                className="group relative bg-card hover:bg-accent/50 border border-border hover:border-primary/30 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Warehouse className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                      {t('hero.shipperCard.title')}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t('hero.shipperCard.description')}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground/70 pt-2">
                    {t('hero.shipperCard.subtitle')}
                  </p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
              </Link>

              {/* Carrier Card */}
              <Link 
                to="/auth?role=carrier"
                className="group relative bg-card hover:bg-accent/50 border border-border hover:border-primary/30 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Truck className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                      {t('hero.carrierCard.title')}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t('hero.carrierCard.description')}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground/70 pt-2">
                    {t('hero.carrierCard.subtitle')}
                  </p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
              </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
