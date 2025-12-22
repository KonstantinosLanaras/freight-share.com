import { useTranslation } from 'react-i18next';
import { Package, Search, CreditCard, Truck, CheckCircle, Route, MessageSquare, UserPlus } from 'lucide-react';

export const HowItWorks = () => {
  const { t } = useTranslation();

  const shipperSteps = [
    { icon: UserPlus, titleKey: 'howItWorks.shipper.step1.title', descriptionKey: 'howItWorks.shipper.step1.description' },
    { icon: Package, titleKey: 'howItWorks.shipper.step2.title', descriptionKey: 'howItWorks.shipper.step2.description' },
    { icon: CheckCircle, titleKey: 'howItWorks.shipper.step3.title', descriptionKey: 'howItWorks.shipper.step3.description' },
    { icon: CreditCard, titleKey: 'howItWorks.shipper.step5.title', descriptionKey: 'howItWorks.shipper.step5.description' },
  ];

  const carrierSteps = [
    { icon: UserPlus, titleKey: 'howItWorks.carrier.step1.title', descriptionKey: 'howItWorks.carrier.step1.description' },
    { icon: Search, titleKey: 'howItWorks.carrier.step2.title', descriptionKey: 'howItWorks.carrier.step2.description' },
    { icon: Package, titleKey: 'howItWorks.carrier.step3.title', descriptionKey: 'howItWorks.carrier.step3.description' },
    { icon: CreditCard, titleKey: 'howItWorks.carrier.step5.title', descriptionKey: 'howItWorks.carrier.step5.description' },
  ];

  return (
    <section id="how-it-works" className="py-24 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Shipper Flow */}
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-shipper/10 rounded-full text-shipper text-sm font-medium mb-6">
              <Package className="h-4 w-4" />
              {t('howItWorks.forShippers')}
            </div>
            <div className="space-y-6">
              {shipperSteps.map((step, index) => (
                <div key={step.titleKey} className="flex gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-shipper/10 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-shipper" />
                    </div>
                    {index < shipperSteps.length - 1 && (
                      <div className="absolute top-12 left-1/2 w-0.5 h-8 bg-border -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="font-semibold text-foreground mb-1">{t(step.titleKey)}</h4>
                    <p className="text-sm text-muted-foreground">{t(step.descriptionKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carrier Flow */}
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-carrier/10 rounded-full text-carrier text-sm font-medium mb-6">
              <Truck className="h-4 w-4" />
              {t('howItWorks.forCarriers')}
            </div>
            <div className="space-y-6">
              {carrierSteps.map((step, index) => (
                <div key={step.titleKey} className="flex gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-carrier/10 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-carrier" />
                    </div>
                    {index < carrierSteps.length - 1 && (
                      <div className="absolute top-12 left-1/2 w-0.5 h-8 bg-border -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="font-semibold text-foreground mb-1">{t(step.titleKey)}</h4>
                    <p className="text-sm text-muted-foreground">{t(step.descriptionKey)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Optional Route Tip */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <Route className="h-5 w-5 text-carrier flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-foreground text-sm mb-1">
                    {t('howItWorks.carrier.optionalRoutes.title')}
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    {t('howItWorks.carrier.optionalRoutes.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};