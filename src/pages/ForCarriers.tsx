import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Truck, CheckCircle, ArrowRight, TrendingUp, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const ForCarriers = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Wallet,
      titleKey: 'forCarriers.benefits.revenue.title',
      descriptionKey: 'forCarriers.benefits.revenue.description',
    },
    {
      icon: TrendingUp,
      titleKey: 'forCarriers.benefits.efficiency.title',
      descriptionKey: 'forCarriers.benefits.efficiency.description',
    },
    {
      icon: Users,
      titleKey: 'forCarriers.benefits.direct.title',
      descriptionKey: 'forCarriers.benefits.direct.description',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-carrier/10 rounded-full text-carrier text-sm font-medium mb-6">
              <Truck className="h-4 w-4" />
              {t('forCarriers.badge')}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              {t('forCarriers.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('forCarriers.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-carrier hover:bg-carrier/90 text-carrier-foreground" asChild>
                <Link to="/auth?mode=signup&role=carrier">
                  {t('forCarriers.cta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/how-it-works">
                  {t('forCarriers.learnHow')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit) => (
              <div key={benefit.titleKey} className="bg-card rounded-xl border border-border p-6">
                <div className="w-12 h-12 rounded-full bg-carrier/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-carrier" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">
                  {t(benefit.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(benefit.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Micro-reinforcement */}
      <section className="py-8 bg-carrier/5 border-y border-carrier/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 inline mr-2 text-carrier" />
            {t('forCarriers.microReinforcement')}
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              {t('forCarriers.ctaTitle')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t('forCarriers.ctaSubtitle')}
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

      <Footer />
    </div>
  );
};

export default ForCarriers;
