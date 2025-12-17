import { Link } from 'react-router-dom';
import { Truck, Package, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <Truck className="h-8 w-8 text-primary-foreground" />
                <Package className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
              </div>
              <span className="font-heading font-bold text-xl">
                Freight<span className="text-accent">Share</span>
              </span>
            </Link>
            <p className="text-sm text-secondary-foreground/70">
              The trusted marketplace connecting shippers and carriers for seamless freight transactions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link to="/how-it-works" className="hover:text-secondary-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-secondary-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/auth?mode=signup&role=shipper" className="hover:text-secondary-foreground transition-colors">For Shippers</Link></li>
              <li><Link to="/auth?mode=signup&role=carrier" className="hover:text-secondary-foreground transition-colors">For Carriers</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link to="/about" className="hover:text-secondary-foreground transition-colors">About Us</Link></li>
              <li><Link to="/terms" className="hover:text-secondary-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-secondary-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-secondary-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Contact Us</h4>
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
            © {new Date().getFullYear()} FreightShare. All rights reserved.
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
