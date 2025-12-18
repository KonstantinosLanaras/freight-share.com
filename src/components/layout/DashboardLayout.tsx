import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  HelpCircle,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { VerificationBadge } from '@/components/verification/VerificationBadge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'shipper' | 'carrier';
  navItems: NavItem[];
  profile?: {
    full_name: string | null;
    company_name: string | null;
    verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected' | null;
  } | null;
}

export function DashboardLayout({ children, role, navItems, profile }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const roleConfig = {
    shipper: {
      label: 'Shipper Account',
      icon: Package,
      color: 'bg-shipper/20 text-shipper-foreground',
      badgeColor: 'bg-shipper text-shipper-foreground',
    },
    carrier: {
      label: 'Carrier Account',
      icon: Truck,
      color: 'bg-carrier/20 text-carrier-foreground',
      badgeColor: 'bg-carrier text-carrier-foreground',
    },
  };

  const config = roleConfig[role];
  const RoleIcon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header Bar - Always Visible */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <Truck className="h-7 w-7 text-primary" />
              <Package className="h-3.5 w-3.5 text-accent absolute -bottom-1 -right-1" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground hidden sm:inline">
              Freight<span className="text-accent">Share</span>
            </span>
          </Link>

          {/* Role Badge - Desktop */}
          <Badge className={`hidden md:flex items-center gap-1.5 ${config.badgeColor}`}>
            <RoleIcon className="h-3.5 w-3.5" />
            {config.label}
          </Badge>
        </div>

        {/* Right side - Always visible actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Help & Resolution */}
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link to="/help">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="sm:hidden">
            <Link to="/help">
              <HelpCircle className="h-5 w-5" />
            </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User info - Desktop */}
          <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">
                {profile?.full_name || profile?.company_name || 'User'}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                {profile?.verification_status && (
                  <VerificationBadge status={profile.verification_status} size="sm" showTooltip={false} />
                )}
                {user?.email}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Sign Out - Always visible */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 
        lg:translate-x-0 pt-16 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile close */}
          <div className="lg:hidden p-4 flex justify-end">
            <button 
              className="text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Badge - Mobile */}
          <div className="px-6 pb-4 lg:pt-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${config.color}`}>
              <RoleIcon className="h-4 w-4" />
              {config.label}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link 
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer - Help link */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Link 
              to="/help"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
              Help & Resolution
            </Link>
            
            {/* Sign out - Always visible at bottom */}
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}