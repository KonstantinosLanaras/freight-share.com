import { useTranslation } from 'react-i18next';
import { Route, Truck, CreditCard, MessageSquare, Star, FileText, Package } from 'lucide-react';

export const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Route,
      titleKey: 'features.directConnections.title',
      descriptionKey: 'features.directConnections.description',
    },
    {
      icon: CreditCard,
      titleKey: 'features.transparentPricing.title',
      descriptionKey: 'features.transparentPricing.description',
    },
    {
      icon: Package,
      titleKey: 'features.securePayments.title',
      descriptionKey: 'features.securePayments.description',
    },
    {
      icon: Truck,
      titleKey: 'features.verifiedPartners.title',
      descriptionKey: 'features.verifiedPartners.description',
    },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-muted-foreground">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
