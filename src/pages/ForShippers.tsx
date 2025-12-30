import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const ForShippers = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Editorial Style */}
      <section className="pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-shipper/10 rounded-full text-shipper text-sm font-medium mb-8">
              <Package className="h-4 w-4" />
              {t('forShippers.badge')}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 leading-tight">
              {t('forShippers.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              {t('forShippers.subtitle')}
            </p>
            <Button size="lg" className="bg-shipper hover:bg-shipper/90 text-shipper-foreground" asChild>
              <Link to="/auth?mode=signup&role=shipper">
                {t('forShippers.cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Outcomes Section - Editorial Layout */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-10">
              What you gain as a shipper
            </h2>
            
            <div className="space-y-10">
              {/* Outcome 1 */}
              <div>
                <h3 className="font-heading font-medium text-foreground mb-2">
                  {t('forShippers.benefits.access.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('forShippers.benefits.access.description')}
                </p>
              </div>
              
              {/* Outcome 2 */}
              <div>
                <h3 className="font-heading font-medium text-foreground mb-2">
                  {t('forShippers.benefits.pricing.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('forShippers.benefits.pricing.description')}
                </p>
              </div>
              
              {/* Outcome 3 */}
              <div>
                <h3 className="font-heading font-medium text-foreground mb-2">
                  {t('forShippers.benefits.verified.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('forShippers.benefits.verified.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Contextual, Reduced Weight */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground mb-6">
              {t('forShippers.microReinforcement')}
            </p>
            <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-4">
              {t('forShippers.ctaTitle')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t('forShippers.ctaSubtitle')}
            </p>
            <Button variant="outline" size="lg" className="border-shipper text-shipper hover:bg-shipper/10" asChild>
              <Link to="/auth?mode=signup&role=shipper">
                {t('forShippers.cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForShippers;