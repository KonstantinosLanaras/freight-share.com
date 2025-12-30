import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, Search, CheckCircle, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HowItWorksPreview = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
            {t('howItWorks.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* Simplified visual - one line per role */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Shipper summary */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-shipper/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-shipper" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">
                  {t('howItWorks.forShippers')}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('howItWorks.shipperIntro')}
              </p>
            </div>

            {/* Carrier summary */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-carrier/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-carrier" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">
                  {t('howItWorks.forCarriers')}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('howItWorks.carrierIntro')}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/how-it-works" className="gap-2">
              {t('howItWorksPreview.seeFullGuide')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
