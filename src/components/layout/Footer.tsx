import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Truck, Package, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <Truck className="h-8 w-8 text-primary" />
                <Package className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
              </div>
              <span className="font-heading font-bold text-xl text-secondary-foreground">
                Freight<span className="text-primary">Share</span>
              </span>
            </Link>
            <p className="text-sm text-secondary-foreground/70">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">{t('footer.platform')}</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><a href="/#how-it-works" className="hover:text-secondary-foreground transition-colors">{t('nav.howItWorks')}</a></li>
              <li><Link to="/auth?mode=signup&role=shipper" className="hover:text-secondary-foreground transition-colors">{t('nav.forShippers')}</Link></li>
              <li><Link to="/auth?mode=signup&role=carrier" className="hover:text-secondary-foreground transition-colors">{t('nav.forCarriers')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link to="/about" className="hover:text-secondary-foreground transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/impact" className="hover:text-secondary-foreground transition-colors">{t('footer.impact')}</Link></li>
              <li><Link to="/terms" className="hover:text-secondary-foreground transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-secondary-foreground transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/contact" className="hover:text-secondary-foreground transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@freightshare.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Logistics Ave<br />Rotterdam, Netherlands</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-secondary-foreground/50">
            © {new Date().getFullYear()} FreightShare. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-sm text-secondary-foreground/50">
            <span>Secure payments powered by</span>
            <span className="font-semibold text-secondary-foreground/70">FreightShare Trust</span>
          </div>
        </div>
      </div>
    </footer>
  );
};