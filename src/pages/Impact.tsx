import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Impact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Header */}
        <header className="container mx-auto px-4 mb-12">
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

            {/* Section 2: Economic Context */}
            <section className="mb-14">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                Economic Context: Households, SMEs, and Market Competition
              </h2>
              <div className="h-px bg-border mb-6" />
              
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  SMEs account for over <strong className="text-foreground">99%</strong> of EU non-financial businesses and form the structural backbone of the European economy (European Commission, 2022). 
                  During the COVID-19 pandemic, <strong className="text-foreground">hundreds of thousands</strong> of SMEs and self-employed businesses across Europe were forced to close (SMEunited, 2021). 
                  Those that survived experienced revenue declines in the range of <strong className="text-foreground">20–40%</strong> during peak disruption, with liquidity stress concentrated among smaller operators (OECD / McKinsey).
                </p>
                <p>
                  At the household level, food and essential goods prices increased by <strong className="text-foreground">20–30%</strong> in parts of the Eurozone between 2019 and 2023 (Eurostat). 
                  Real household purchasing power declined across multiple EU member states, with inflation eroding income gains (European Central Bank). 
                  These cost pressures disproportionately affected lower-income households, who allocate a larger share of spending to essentials (Financial Times). 
                  Improving market competition, reducing transaction inefficiencies, and enabling SMEs to source internationally are structural mechanisms that can support price discipline and economic resilience — without guaranteeing specific outcomes.
                </p>
              </div>
            </section>

            {/* Section 3: Design Choices */}
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

            {/* Subtle text link footer */}
            <footer className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {t('impactPage.cta.text')}{' '}
                <Link to="/how-it-works" className="text-primary hover:underline">
                  {t('nav.howItWorks')}
                </Link>
              </p>
            </footer>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Impact;
