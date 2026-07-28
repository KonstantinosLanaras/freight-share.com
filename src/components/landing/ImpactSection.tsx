import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Users, Leaf, ArrowRight, TrendingDown, Percent, BarChart3, CloudCog } from 'lucide-react';

export const ImpactSection = () => {
  const { t } = useTranslation();

  // Source URLs live here, not in the translated JSON -- a citation's
  // URL doesn't change per locale, so it shouldn't be duplicated (and
  // risk drifting out of sync) across en/fr/el.
  const stats = [
    {
      icon: TrendingDown,
      valueKey: 'impact.stats.emptyMiles.value',
      labelKey: 'impact.stats.emptyMiles.label',
      sourceKey: 'impact.stats.emptyMiles.source',
      sourceUrl: 'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Road_freight_transport_by_journey_characteristics',
    },
    {
      icon: Percent,
      valueKey: 'impact.stats.smeShare.value',
      labelKey: 'impact.stats.smeShare.label',
      sourceKey: 'impact.stats.smeShare.source',
      sourceUrl: 'https://publications.jrc.ec.europa.eu/repository/handle/JRC138678',
    },
    {
      icon: BarChart3,
      valueKey: 'impact.stats.fragmentation.value',
      labelKey: 'impact.stats.fragmentation.label',
      sourceKey: 'impact.stats.fragmentation.source',
      sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:52014DC0222',
    },
    {
      icon: CloudCog,
      valueKey: 'impact.stats.co2Emissions.value',
      labelKey: 'impact.stats.co2Emissions.label',
      sourceKey: 'impact.stats.co2Emissions.source',
      sourceUrl: 'https://www.eea.europa.eu/publications/co2-emissions-of-new-heavy/reducing-greenhouse-gas-emissions-from',
    },
  ];

  const socialPoints = [
    t('impact.social.point1'),
    t('impact.social.point2'),
    t('impact.social.point3'),
  ];

  const environmentalPoints = [
    t('impact.environmental.point1'),
    t('impact.environmental.point2'),
    t('impact.environmental.point3'),
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            {t('impact.missionTitle', 'Our Mission')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('impact.missionSubtitle', 'Making freight logistics fairer, greener, and more accessible for everyone.')}
          </p>
        </div>

        {/* Key Statistics with Sources */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
          {stats.map((stat) => (
            <div key={stat.valueKey} className="bg-card rounded-lg border border-border p-4 text-center">
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{t(stat.valueKey)}</p>
              <p className="text-xs text-muted-foreground mt-1">{t(stat.labelKey)}</p>
              <a
                href={stat.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[10px] text-primary/80 hover:text-primary underline mt-2"
              >
                {t(stat.sourceKey)}
              </a>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Social Impact */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">
                {t('impact.social.title')}
              </h3>
            </div>
            <ul className="space-y-1.5">
              {socialPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Environmental Impact */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">
                {t('impact.environmental.title')}
              </h3>
            </div>
            <ul className="space-y-1.5">
              {environmentalPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-accent mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link 
            to="/impact" 
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {t('impact.learnMore')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};