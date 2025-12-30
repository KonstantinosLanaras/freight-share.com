import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  UserPlus, 
  Search, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  CreditCard,
  ArrowRight,
  Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingHelpWidget } from '@/components/FloatingHelpWidget';

const HowItWorksPage = () => {
  const { t } = useTranslation();

  const shipperSteps = [
    { 
      icon: UserPlus, 
      number: 1,
      titleKey: 'howItWorks.shipper.step1.title', 
      descriptionKey: 'howItWorks.shipper.step1.description' 
    },
    { 
      icon: Package, 
      number: 2,
      titleKey: 'howItWorks.shipper.step2.title', 
      descriptionKey: 'howItWorks.shipper.step2.description' 
    },
    { 
      icon: Users, 
      number: 3,
      titleKey: 'howItWorks.shipper.step3.title', 
      descriptionKey: 'howItWorks.shipper.step3.description' 
    },
    { 
      icon: MessageSquare, 
      number: 4,
      titleKey: 'howItWorks.shipper.step4.title', 
      descriptionKey: 'howItWorks.shipper.step4.description' 
    },
    { 
      icon: CheckCircle, 
      number: 5,
      titleKey: 'howItWorks.shipper.step5.title', 
      descriptionKey: 'howItWorks.shipper.step5.description' 
    },
  ];

  const carrierSteps = [
    { 
      icon: UserPlus, 
      number: 1,
      titleKey: 'howItWorks.carrier.step1.title', 
      descriptionKey: 'howItWorks.carrier.step1.description' 
    },
    { 
      icon: Search, 
      number: 2,
      titleKey: 'howItWorks.carrier.step2.title', 
      descriptionKey: 'howItWorks.carrier.step2.description' 
    },
    { 
      icon: Package, 
      number: 3,
      titleKey: 'howItWorks.carrier.step3.title', 
      descriptionKey: 'howItWorks.carrier.step3.description' 
    },
    { 
      icon: MessageSquare, 
      number: 4,
      titleKey: 'howItWorks.carrier.step4.title', 
      descriptionKey: 'howItWorks.carrier.step4.description' 
    },
    { 
      icon: CreditCard, 
      number: 5,
      titleKey: 'howItWorks.carrier.step5.title', 
      descriptionKey: 'howItWorks.carrier.step5.description' 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingHelpWidget />
      
      {/* Hero Section - Compact */}
      <section className="pt-20 pb-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3 text-center">
              {t('howItWorks.pageTitle')}
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto text-center">
              {t('howItWorks.pageSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Two Paths Section */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            
            {/* Shipper Path */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
              <div className="bg-shipper/10 p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-shipper/20 flex items-center justify-center">
                    <Package className="h-5 w-5 text-shipper" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-foreground">
                    {t('howItWorks.forShippers')}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {t('howItWorks.shipperIntro')}
                </p>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <div className="space-y-6">
                  {shipperSteps.map((step, index) => (
                    <div key={step.titleKey} className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-shipper text-shipper-foreground flex items-center justify-center font-bold text-lg">
                          {step.number}
                        </div>
                        {index < shipperSteps.length - 1 && (
                          <div className="absolute top-14 left-1/2 w-0.5 h-10 bg-shipper/20 -translate-x-1/2" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <step.icon className="h-4 w-4 text-shipper" />
                          <h4 className="font-semibold text-foreground">{t(step.titleKey)}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t(step.descriptionKey)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Spacer to push CTA to bottom */}
                <div className="flex-grow" />
                
                {/* Shipper CTA */}
                <div className="mt-8 pt-6 border-t border-border space-y-3">
                  <Button className="w-full bg-shipper hover:bg-shipper/90 text-shipper-foreground" size="lg" asChild>
                    <Link to="/auth?mode=login">
                      {t('howItWorks.loginButton')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link to="/auth?mode=signup&role=shipper">
                      {t('howItWorks.signupButton')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Carrier Path */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
              <div className="bg-carrier/10 p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-carrier/20 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-carrier" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-foreground">
                    {t('howItWorks.forCarriers')}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {t('howItWorks.carrierIntro')}
                </p>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <div className="space-y-6">
                  {carrierSteps.map((step, index) => (
                    <div key={step.titleKey} className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-carrier text-carrier-foreground flex items-center justify-center font-bold text-lg">
                          {step.number}
                        </div>
                        {index < carrierSteps.length - 1 && (
                          <div className="absolute top-14 left-1/2 w-0.5 h-10 bg-carrier/20 -translate-x-1/2" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <step.icon className="h-4 w-4 text-carrier" />
                          <h4 className="font-semibold text-foreground">{t(step.titleKey)}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t(step.descriptionKey)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Route Tip */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-carrier/10 flex items-center justify-center flex-shrink-0">
                      <Route className="h-4 w-4 text-carrier" />
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground text-sm mb-1">
                        {t('howItWorks.carrier.optionalRoutes.title')}
                      </h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('howItWorks.carrier.optionalRoutes.description')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Spacer to push CTA to bottom */}
                <div className="flex-grow" />
                
                {/* Carrier CTA */}
                <div className="mt-8 pt-6 border-t border-border space-y-3">
                  <Button className="w-full bg-carrier hover:bg-carrier/90 text-carrier-foreground" size="lg" asChild>
                    <Link to="/auth?mode=login">
                      {t('howItWorks.loginButton')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link to="/auth?mode=signup&role=carrier">
                      {t('howItWorks.signupButton')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-background mb-4">
              {t('howItWorks.ctaTitle')}
            </h2>
            <p className="text-lg text-background/70 mb-8">
              {t('howItWorks.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link to="/auth?mode=login">
                  {t('howItWorks.loginButton')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-background/80 bg-transparent text-background hover:bg-background/10 hover:border-background"
                asChild
              >
                <Link to="/auth?mode=signup">
                  {t('howItWorks.signupButton')}
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-background/60 text-sm">
              {t('howItWorks.alreadyMember')}{' '}
              <Link to="/auth?mode=login" className="text-background underline hover:no-underline">
                {t('nav.logIn')}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;