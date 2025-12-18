import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Truck, Package, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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
              Home
            </Link>
            <Link 
              to="/why-freightshare" 
              className={`text-sm font-medium transition-colors ${isActive('/why-freightshare') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Why FreightShare
            </Link>
            <a 
              href="/#how-it-works" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <>
                <Button variant="default" asChild>
                  <Link to={dashboardPath}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{role} account</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={dashboardPath}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Go to Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button variant="accent" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )}
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
              <a 
                href="/#how-it-works" 
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </a>
              
              <div className="flex gap-2 px-4 pt-2">
                {!loading && user ? (
                  <>
                    <Button variant="default" className="flex-1" asChild>
                      <Link to={dashboardPath} onClick={() => setIsOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>Log In</Link>
                    </Button>
                    <Button variant="accent" className="flex-1" asChild>
                      <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>Get Started</Link>
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
