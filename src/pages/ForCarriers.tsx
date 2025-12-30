import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const ForCarriers = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Editorial Style */}
      <section className="pt-24 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-carrier/10 rounded-full text-carrier text-sm font-medium mb-6">
              <Truck className="h-4 w-4" />
              {t('forCarriers.badge')}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4 leading-tight">
              {t('forCarriers.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('forCarriers.subtitle')}
            </p>
            <Button size="lg" className="bg-carrier hover:bg-carrier/90 text-carrier-foreground" asChild>
              <Link to="/auth?mode=signup&role=carrier">
                {t('forCarriers.cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Outcomes Section - Editorial Layout */}
      <section className="py-12 md:py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-8">
              {t('forCarriers.outcomesTitle')}
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">
                  {t('forCarriers.benefits.revenue.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('forCarriers.benefits.revenue.description')}
                </p>
              </div>
              
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">
                  {t('forCarriers.benefits.efficiency.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('forCarriers.benefits.efficiency.description')}
                </p>
              </div>
              
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">
                  {t('forCarriers.benefits.direct.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('forCarriers.benefits.direct.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default ForCarriers;