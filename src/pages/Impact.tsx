import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Impact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Header */}
        <header className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('impactPage.title')}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('impactPage.subtitle')}
            </p>
          </div>
        </header>

        {/* Article Content */}
        <article className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            
            {/* Section 1: The Market Problem */}
            <section className="mb-14">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                {t('impactPage.problem.title')}
              </h2>
              <div className="h-px bg-border mb-6" />
              
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>{t('impactPage.problem.fragmentation')}</p>
                <p>{t('impactPage.problem.emptyMiles')}</p>
                <p>{t('impactPage.problem.smeAccess')}</p>
                <p>{t('impactPage.problem.opacity')}</p>
              </div>
            </section>

            {/* Section 2: Design Choices */}
            <section className="mb-14">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                {t('impactPage.design.title')}
              </h2>
              <div className="h-px bg-border mb-6" />
              
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>{t('impactPage.design.intro')}</p>
                
                <p><strong className="text-foreground font-medium">1. {t('impactPage.design.choice1Title')}</strong><br />
                {t('impactPage.design.choice1Desc')}</p>
                
                <p><strong className="text-foreground font-medium">2. {t('impactPage.design.choice2Title')}</strong><br />
                {t('impactPage.design.choice2Desc')}</p>
                
                <p><strong className="text-foreground font-medium">3. {t('impactPage.design.choice3Title')}</strong><br />
                {t('impactPage.design.choice3Desc')}</p>
                
                <p><strong className="text-foreground font-medium">4. {t('impactPage.design.choice4Title')}</strong><br />
                {t('impactPage.design.choice4Desc')}</p>
              </div>
            </section>

            {/* Section 3: Social Impact */}
            <section className="mb-14">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                {t('impactPage.social.title')}
              </h2>
              <div className="h-px bg-border mb-6" />
              
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>{t('impactPage.social.access')}</p>
                <p>{t('impactPage.social.pricing')}</p>
                <p>{t('impactPage.social.intermediaries')}</p>
              </div>
            </section>

            {/* Section 4: Environmental Impact */}
            <section className="mb-14">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                {t('impactPage.environmental.title')}
              </h2>
              <div className="h-px bg-border mb-6" />
              
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>{t('impactPage.environmental.intro')}</p>
                <p>{t('impactPage.environmental.capacity')}</p>
                <p>{t('impactPage.environmental.emptyTrips')}</p>
                <p>{t('impactPage.environmental.emissions')}</p>
              </div>
            </section>

            {/* Section 5: What We Don't Claim */}
            <section className="mb-14">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                {t('impactPage.disclaimer.title')}
              </h2>
              <div className="h-px bg-border mb-6" />
              
              <div className="space-y-5 text-muted-foreground leading-relaxed text-sm">
                <p>{t('impactPage.disclaimer.text1')}</p>
                <p>{t('impactPage.disclaimer.text2')}</p>
                <p>{t('impactPage.disclaimer.text3')}</p>
              </div>
            </section>

            {/* Minimal CTA */}
            <footer className="pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('impactPage.cta.text')}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/how-it-works">{t('nav.howItWorks')}</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/auth?mode=signup">{t('nav.getStarted')}</Link>
                  </Button>
                </div>
              </div>
            </footer>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Impact;
