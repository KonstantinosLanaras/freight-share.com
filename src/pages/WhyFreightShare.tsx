import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { 
  Package,
  Route,
  ArrowRight,
  Truck,
  Euro,
  Users,
  Leaf,
  TrendingUp,
  Globe,
  CreditCard,
  BarChart3,
  Target,
  ShoppingCart
} from 'lucide-react';

const WhyFreightShare = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* SECTION 1: Introduction */}
        <section className="container mx-auto px-4 mb-24">
          <div className="max-w-3xl mx-auto">
            <p className="text-primary font-medium mb-4 uppercase tracking-wide text-sm text-center">{t('whyFreightShare.tagline')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-8 leading-tight text-center">
              {t('whyFreightShare.title')}
            </h1>
          </div>
        </section>

        {/* SECTION 2: The Scale of Inefficiency */}
        <section className="bg-secondary/5 py-20 mb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4 text-center">
                  {t('whyFreightShare.scaleTitle')}
                </h2>
                <p className="text-muted-foreground text-lg text-left">
                  {t('whyFreightShare.scaleSubtitle')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat Card 1 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-foreground mb-2">{t('whyFreightShare.stat1.value')}</div>
                  <p className="text-muted-foreground text-sm mb-4">{t('whyFreightShare.stat1.label')}</p>
                  <p className="text-xs text-muted-foreground/70">{t('whyFreightShare.stat1.source')}</p>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 rounded-xl bg-accent/10 w-fit mb-4">
                    <Euro className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-foreground mb-2">{t('whyFreightShare.stat2.value')}</div>
                  <p className="text-muted-foreground text-sm mb-4">{t('whyFreightShare.stat2.label')}</p>
                  <p className="text-xs text-muted-foreground/70">{t('whyFreightShare.stat2.source')}</p>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 rounded-xl bg-destructive/10 w-fit mb-4">
                    <Users className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-foreground mb-2">{t('whyFreightShare.stat3.value')}</div>
                  <p className="text-muted-foreground text-sm mb-4">{t('whyFreightShare.stat3.label')}</p>
                  <p className="text-xs text-muted-foreground/70">{t('whyFreightShare.stat3.source')}</p>
                </div>

                {/* Stat Card 4 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-foreground mb-2">{t('whyFreightShare.stat4.value')}</div>
                  <p className="text-muted-foreground text-sm mb-4">{t('whyFreightShare.stat4.label')}</p>
                  <p className="text-xs text-muted-foreground/70">{t('whyFreightShare.stat4.source')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: What FreightShare Changes (Mechanism) */}
        <section className="container mx-auto px-4 mb-24">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4 text-center">
                {t('whyFreightShare.mechanismTitle')}
              </h2>
              <p className="text-muted-foreground text-lg text-left">
                {t('whyFreightShare.mechanismSubtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('whyFreightShare.step1.title')}</h3>
                  <p className="text-muted-foreground text-sm">{t('whyFreightShare.step1.description')}</p>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-muted-foreground/30">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                    <Route className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('whyFreightShare.step2.title')}</h3>
                  <p className="text-muted-foreground text-sm">{t('whyFreightShare.step2.description')}</p>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-muted-foreground/30">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('whyFreightShare.step3.title')}</h3>
                  <p className="text-muted-foreground text-sm">{t('whyFreightShare.step3.description')}</p>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-muted-foreground/30">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('whyFreightShare.step4.title')}</h3>
                  <p className="text-muted-foreground text-sm">{t('whyFreightShare.step4.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Efficiency → Competitiveness → Lower Emissions */}
        <section className="bg-primary/5 py-20 mb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4 text-center">
                  {t('whyFreightShare.efficiencyTitle')}
                </h2>
                <p className="text-muted-foreground text-lg text-left">
                  {t('whyFreightShare.efficiencySubtitle')}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Visual Comparison */}
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h3 className="font-semibold text-foreground mb-6">{t('whyFreightShare.utilizationTitle')}</h3>
                  
                  <div className="space-y-6">
                    {/* Current State */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{t('whyFreightShare.currentUtilization')}</span>
                        <span className="font-medium text-foreground">~70%</span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>

                    {/* Improved State */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{t('whyFreightShare.improvedUtilization')}</span>
                        <span className="font-medium text-primary">~80%</span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('whyFreightShare.co2Reduction')}</p>
                        <p className="font-semibold text-foreground">{t('whyFreightShare.co2Value')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="p-2 h-fit rounded-lg bg-primary/10 shrink-0">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{t('whyFreightShare.betterLoadFactors.title')}</h4>
                      <p className="text-muted-foreground text-sm">{t('whyFreightShare.betterLoadFactors.description')}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="p-2 h-fit rounded-lg bg-primary/10 shrink-0">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{t('whyFreightShare.noAdditionalVehicles.title')}</h4>
                      <p className="text-muted-foreground text-sm">{t('whyFreightShare.noAdditionalVehicles.description')}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="p-2 h-fit rounded-lg bg-primary/10 shrink-0">
                      <Leaf className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{t('whyFreightShare.lowerEmissions.title')}</h4>
                      <p className="text-muted-foreground text-sm">{t('whyFreightShare.lowerEmissions.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Value for SMEs and Carriers */}
        <section className="container mx-auto px-4 mb-24">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4 text-center">
                {t('whyFreightShare.valueTitle')}
              </h2>
              <p className="text-muted-foreground text-lg text-left">
                {t('whyFreightShare.valueSubtitle')}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* SMEs Column */}
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-foreground">{t('whyFreightShare.forSMEs')}</h3>
                </div>
                
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{t('whyFreightShare.sme1.title')}</p>
                      <p className="text-sm text-muted-foreground">{t('whyFreightShare.sme1.description')}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{t('whyFreightShare.sme2.title')}</p>
                      <p className="text-sm text-muted-foreground">{t('whyFreightShare.sme2.description')}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{t('whyFreightShare.sme3.title')}</p>
                      <p className="text-sm text-muted-foreground">{t('whyFreightShare.sme3.description')}</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Carriers Column */}
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Truck className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-foreground">{t('whyFreightShare.forCarriers')}</h3>
                </div>
                
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{t('whyFreightShare.carrier1.title')}</p>
                      <p className="text-sm text-muted-foreground">{t('whyFreightShare.carrier1.description')}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{t('whyFreightShare.carrier2.title')}</p>
                      <p className="text-sm text-muted-foreground">{t('whyFreightShare.carrier2.description')}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{t('whyFreightShare.carrier3.title')}</p>
                      <p className="text-sm text-muted-foreground">{t('whyFreightShare.carrier3.description')}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: Downstream Effects */}
        <section className="container mx-auto px-4 mb-24">
          <div className="max-w-3xl mx-auto">
            <div className="bg-muted/30 border border-border rounded-2xl p-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-4 text-center">
                {t('whyFreightShare.downstreamTitle')}
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto text-left">
                {t('whyFreightShare.downstreamText')}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 7: CTA */}
        <section className="container mx-auto px-4 mb-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-secondary rounded-2xl p-10 md:p-14 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-secondary-foreground mb-4">
                {t('whyFreightShare.ctaTitle')}
              </h2>
              <p className="text-secondary-foreground/70 mb-8 max-w-xl mx-auto">
                {t('whyFreightShare.ctaSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="default" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link to="/auth?mode=signup&role=shipper" className="gap-2">
                    <Package className="h-4 w-4" />
                    {t('hero.postLoad')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary-foreground/80 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground focus:ring-2 focus:ring-primary-foreground/50" asChild>
                  <Link to="/auth?mode=signup&role=carrier" className="gap-2">
                    <Route className="h-4 w-4" />
                    {t('hero.postRoute')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: Sources */}
        <section className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="border-t border-border pt-8">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">{t('whyFreightShare.sourcesTitle')}</h4>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground/70">
                <p>• {t('whyFreightShare.source1')}</p>
                <p>• {t('whyFreightShare.source2')}</p>
                <p>• {t('whyFreightShare.source3')}</p>
                <p>• {t('whyFreightShare.source4')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default WhyFreightShare;
