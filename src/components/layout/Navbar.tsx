import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Menu, X, Truck, Package, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DemoModeToggle } from '@/components/DemoModeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut, loading } = useAuth();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dashboardPath = role === 'carrier' ? '/dashboard/carrier' : '/dashboard/shipper';

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
              {t('nav.home')}
            </Link>
            <Link 
              to="/how-it-works" 
              className={`text-sm font-medium transition-colors ${isActive('/how-it-works') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t('nav.howItWorks')}
            </Link>
            {/* Solutions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.solutions')}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-popover border border-border">
                <DropdownMenuItem asChild>
                  <Link to="/for-shippers" className="cursor-pointer">
                    <Package className="h-4 w-4 mr-2" />
                    {t('nav.forShippers')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/for-carriers" className="cursor-pointer">
                    <Truck className="h-4 w-4 mr-2" />
                    {t('nav.forCarriers')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Buttons + Language Selector - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <DemoModeToggle />
            <LanguageSelector />
            {!loading && user ? (
              <>
                <Button variant="default" asChild>
                  <Link to={dashboardPath}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t('nav.dashboard')}
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border border-border">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{role} account</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={dashboardPath}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {t('nav.goToDashboard')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('nav.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">{t('nav.logIn')}</Link>
                </Button>
                <Button variant="accent" asChild>
                  <Link to="/auth?mode=signup">{t('nav.getStarted')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <DemoModeToggle />
            <LanguageSelector />
            <button
              className="p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
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
                {t('nav.home')}
              </Link>
              <Link 
                to="/how-it-works" 
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                {t('nav.howItWorks')}
              </Link>
              
              {/* Solutions section for mobile */}
              <div className="px-4 py-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t('nav.solutions')}</p>
                <Link 
                  to="/for-shippers" 
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <Package className="h-4 w-4" />
                  {t('nav.forShippers')}
                </Link>
                <Link 
                  to="/for-carriers" 
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <Truck className="h-4 w-4" />
                  {t('nav.forCarriers')}
                </Link>
              </div>
              
              <div className="flex gap-2 px-4 pt-2">
                {!loading && user ? (
                  <>
                    <Button variant="default" className="flex-1" asChild>
                      <Link to={dashboardPath} onClick={() => setIsOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {t('nav.dashboard')}
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>{t('nav.logIn')}</Link>
                    </Button>
                    <Button variant="accent" className="flex-1" asChild>
                      <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>{t('nav.getStarted')}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};