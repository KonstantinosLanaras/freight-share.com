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
  Headphones,
  Phone,
  Mail,
  ArrowRight,
  Shield,
  Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

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
      
      {/* Hero Section - Compact */}
      <section className="pt-20 pb-6">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Main Hero Content */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
                  {t('howItWorks.pageTitle')}
                </h1>
                <p className="text-base text-muted-foreground mb-4 max-w-xl">
                  {t('howItWorks.pageSubtitle')}
                </p>
                
                {/* Compact intro card */}
                <div className="bg-card rounded-xl border border-border p-4 md:p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Route className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-lg font-heading font-semibold text-foreground">
                      {t('howItWorks.introTitle')}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                    {t('howItWorks.introText')}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Verified carriers • Secure payments • Trusted by SMEs
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Compact Help Widget */}
              <div className="lg:w-56 flex-shrink-0">
                <div className="bg-muted/50 rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Headphones className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground text-sm">{t('howItWorks.supportTitle')}</span>
                  </div>
                  <div className="space-y-2">
                    <a 
                      href={`tel:${t('howItWorks.phoneNumber')}`}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {t('howItWorks.phoneNumber')}
                    </a>
                    <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat with us
                    </button>
                    <a 
                      href={`mailto:${t('howItWorks.emailAddress')}`}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {t('howItWorks.emailAddress')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Paths Section */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            
            {/* Shipper Path */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
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
              
              <div className="p-6 md:p-8">
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
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
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
              
              <div className="p-6 md:p-8">
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

      {/* Support Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 via-muted/50 to-primary/5 rounded-2xl border border-primary/20 p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Headphones className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-heading font-bold text-foreground mb-3">
                  {t('howItWorks.supportTitle')}
                </h2>
                <p className="text-lg text-muted-foreground mb-2">
                  {t('howItWorks.supportSubtitle')}
                </p>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('howItWorks.supportText')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Chat Option */}
                <div className="bg-card rounded-xl border border-border p-6 text-center hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t('howItWorks.chatOption')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('howItWorks.chatDescription')}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat Now
                  </Button>
                </div>

                {/* Phone Option */}
                <div className="bg-card rounded-xl border border-border p-6 text-center hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t('howItWorks.phoneOption')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('howItWorks.phoneDescription')}
                  </p>
                  <a 
                    href={`tel:${t('howItWorks.phoneNumber')}`}
                    className="inline-flex items-center justify-center gap-2 text-primary font-medium hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {t('howItWorks.phoneNumber')}
                  </a>
                </div>

                {/* Email Option */}
                <div className="bg-card rounded-xl border border-border p-6 text-center hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t('howItWorks.emailOption')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('howItWorks.emailDescription')}
                  </p>
                  <a 
                    href={`mailto:${t('howItWorks.emailAddress')}`}
                    className="inline-flex items-center justify-center gap-2 text-primary font-medium hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {t('howItWorks.emailAddress')}
                  </a>
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