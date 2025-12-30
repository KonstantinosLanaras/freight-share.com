import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useTranslation } from 'react-i18next';
import { Users, Leaf, TrendingUp, Scale, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Impact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Header */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('impactPage.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('impactPage.subtitle')}
            </p>
          </div>
        </section>

        {/* Market Problem */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="text-2xl font-heading font-semibold text-foreground">
                {t('impactPage.problem.title')}
              </h2>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <p className="text-muted-foreground">
                {t('impactPage.problem.fragmentation')}
              </p>
              <p className="text-muted-foreground">
                {t('impactPage.problem.emptyMiles')}
              </p>
              <p className="text-muted-foreground">
                {t('impactPage.problem.opacity')}
              </p>
            </div>
          </div>
        </section>

        {/* Design Choices */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-heading font-semibold text-foreground">
                {t('impactPage.design.title')}
              </h2>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <p className="text-muted-foreground mb-4">
                {t('impactPage.design.intro')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary mt-1 font-bold">1.</span>
                  <span>{t('impactPage.design.choice1')}</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary mt-1 font-bold">2.</span>
                  <span>{t('impactPage.design.choice2')}</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary mt-1 font-bold">3.</span>
                  <span>{t('impactPage.design.choice3')}</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary mt-1 font-bold">4.</span>
                  <span>{t('impactPage.design.choice4')}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Social Impact */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-shipper/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-shipper" />
              </div>
              <h2 className="text-2xl font-heading font-semibold text-foreground">
                {t('impactPage.social.title')}
              </h2>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <p className="text-muted-foreground">
                {t('impactPage.social.access')}
              </p>
              <p className="text-muted-foreground">
                {t('impactPage.social.pricing')}
              </p>
              <p className="text-muted-foreground">
                {t('impactPage.social.intermediaries')}
              </p>
            </div>
          </div>
        </section>

        {/* Environmental Impact */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-2xl font-heading font-semibold text-foreground">
                {t('impactPage.environmental.title')}
              </h2>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <p className="text-muted-foreground">
                {t('impactPage.environmental.capacity')}
              </p>
              <p className="text-muted-foreground">
                {t('impactPage.environmental.emptyTrips')}
              </p>
              <p className="text-muted-foreground">
                {t('impactPage.environmental.emissions')}
              </p>
            </div>
          </div>
        </section>

        {/* What We Don't Claim */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-heading font-semibold text-foreground">
                {t('impactPage.disclaimer.title')}
              </h2>
            </div>
            <div className="bg-muted/50 rounded-xl border border-border p-6">
              <p className="text-muted-foreground text-sm">
                {t('impactPage.disclaimer.text')}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
              {t('impactPage.cta.title')}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/auth?mode=signup">{t('nav.getStarted')}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/how-it-works">{t('nav.howItWorks')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Impact;