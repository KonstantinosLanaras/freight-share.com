import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Users, Leaf, ArrowRight } from 'lucide-react';

export const ImpactSection = () => {
  const { t } = useTranslation();

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
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
            {t('impact.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('impact.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Social Impact */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">
                {t('impact.social.title')}
              </h3>
            </div>
            <ul className="space-y-2">
              {socialPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Environmental Impact */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">
                {t('impact.environmental.title')}
              </h3>
            </div>
            <ul className="space-y-2">
              {environmentalPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-accent mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mt-8">
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