import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Route, Search } from 'lucide-react';
import heroMapBackground from '@/assets/hero-map-background.png';
import logisticsIllustration from '@/assets/logistics-illustration.png';

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* European map background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroMapBackground})` }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
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
                <Link to="/auth?role=shipper">
                  {t('hero.postLoad')}
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
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                {t('nav.logIn')}
              </Link>
            </p>

            {/* Logistics Illustration */}
            <div className="pt-8 lg:pt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <img 
                src={logisticsIllustration} 
                alt="Direct freight connections between shippers and carriers" 
                className="w-full max-w-3xl mx-auto"
              />
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-8 lg:pt-12 border-t border-border max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.35s' }}>
              <div className="text-center md:text-left">
                <div className="text-base lg:text-lg font-heading font-bold text-foreground mb-2">{t('features.directConnections.title')}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{t('features.directConnections.description')}</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-base lg:text-lg font-heading font-bold text-foreground mb-2">{t('features.securePayments.title')}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{t('features.securePayments.description')}</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-base lg:text-lg font-heading font-bold text-foreground mb-2">{t('features.transparentPricing.title')}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{t('features.transparentPricing.description')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};