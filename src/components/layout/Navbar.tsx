import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Truck, Package } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <Truck className="h-8 w-8 text-primary" />
              <Package className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              Freight<span className="text-primary">Share</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Home
            </Link>
            <Link 
              to="/why-freightshare" 
              className={`text-sm font-medium transition-colors ${isActive('/why-freightshare') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Why FreightShare
            </Link>
            <Link 
              to="/how-it-works" 
              className={`text-sm font-medium transition-colors ${isActive('/how-it-works') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              How It Works
            </Link>
            <Link 
              to="/pricing" 
              className={`text-sm font-medium transition-colors ${isActive('/pricing') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Pricing
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth?mode=login">Log In</Link>
            </Button>
            <Button variant="accent" asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-3">
              <Link 
                to="/" 
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/why-freightshare" 
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Why FreightShare
              </Link>
              <Link 
                to="/how-it-works" 
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                to="/pricing" 
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <div className="flex gap-2 px-4 pt-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/auth?mode=login" onClick={() => setIsOpen(false)}>Log In</Link>
                </Button>
                <Button variant="accent" className="flex-1" asChild>
                  <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
