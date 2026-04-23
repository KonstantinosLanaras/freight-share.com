import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SchengenCountrySelect } from '@/components/SchengenCountrySelect';
import { Truck, Package, ArrowLeft, Mail, User, Building, Loader2, Globe, ShieldCheck, Users, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { getSafeErrorMessage } from '@/lib/errorUtils';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { PasswordInput, validatePassword } from '@/components/auth/PasswordInput';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';

type AuthMode = 'login' | 'signup';
type UserRole = 'shipper' | 'carrier';

const emailSchema = z.string().email('Please enter a valid email address');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minute window for counting attempts

// Get stored rate limit data
const getRateLimitData = (): { attempts: number[]; lockoutUntil: number | null } => {
  try {
    const stored = localStorage.getItem('auth_rate_limit');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { attempts: [], lockoutUntil: null };
};

// Save rate limit data
const saveRateLimitData = (data: { attempts: number[]; lockoutUntil: number | null }) => {
  try {
    localStorage.setItem('auth_rate_limit', JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
};


export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, role: userRole, signUp, signIn, signOut, loading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRoleSwitchWarning, setShowRoleSwitchWarning] = useState(false);
  const [intendedRole, setIntendedRole] = useState<UserRole | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    country: '',
  });

  // Handle redirect after auth
  useEffect(() => {
    if (user && userRole) {
      const roleParam = searchParams.get('role');
      
      if (roleParam && roleParam !== userRole) {
        setShowRoleSwitchWarning(true);
        setIntendedRole(roleParam as UserRole);
        return;
      }
      
      // If a role was selected on the login form, go directly to that dashboard
      if (role) {
        navigate(role === 'carrier' ? '/dashboard/carrier' : '/dashboard/shipper', { replace: true });
      } else {
        navigate('/select-role', { replace: true });
      }
    }
  }, [user, userRole, navigate, searchParams, role]);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const roleParam = searchParams.get('role');
    
    if (!showRoleSwitchWarning) {
      if (modeParam === 'signup') {
        setMode('signup');
        if (roleParam === 'shipper' || roleParam === 'carrier') {
          setRole(roleParam);
          setStep('details');
        }
      } else {
        setMode('login');
        if (roleParam === 'shipper' || roleParam === 'carrier') {
          setRole(roleParam);
          setStep('details');
        }
      }
    }
  }, [searchParams, showRoleSwitchWarning]);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('details');
  };

  const checkRateLimit = (): { allowed: boolean; remainingAttempts?: number; lockoutMinutes?: number } => {
    const data = getRateLimitData();
    const now = Date.now();
    
    // Check if currently locked out
    if (data.lockoutUntil && now < data.lockoutUntil) {
      const remainingMinutes = Math.ceil((data.lockoutUntil - now) / 60000);
      return { allowed: false, lockoutMinutes: remainingMinutes };
    }
    
    // Clear lockout if expired
    if (data.lockoutUntil && now >= data.lockoutUntil) {
      data.lockoutUntil = null;
      data.attempts = [];
      saveRateLimitData(data);
    }
    
    // Filter attempts within the window
    const recentAttempts = data.attempts.filter(t => now - t < ATTEMPT_WINDOW);
    const remaining = MAX_ATTEMPTS - recentAttempts.length;
    
    return { allowed: true, remainingAttempts: remaining };
  };

  const recordFailedAttempt = () => {
    const data = getRateLimitData();
    const now = Date.now();
    
    // Filter and add new attempt
    const recentAttempts = data.attempts.filter(t => now - t < ATTEMPT_WINDOW);
    recentAttempts.push(now);
    data.attempts = recentAttempts;
    
    // Check if should lock out
    if (recentAttempts.length >= MAX_ATTEMPTS) {
      data.lockoutUntil = now + LOCKOUT_DURATION;
    }
    
    saveRateLimitData(data);
    return data.lockoutUntil !== null;
  };

  const clearRateLimit = () => {
    saveRateLimitData({ attempts: [], lockoutUntil: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Rate limiting for login
      if (mode === 'login') {
        const rateCheck = checkRateLimit();
        if (!rateCheck.allowed) {
          toast.error(`Too many failed attempts. Please try again in ${rateCheck.lockoutMinutes} minute${rateCheck.lockoutMinutes !== 1 ? 's' : ''}.`);
          setIsSubmitting(false);
          return;
        }
      }

      // Validate email
      emailSchema.parse(formData.email);
      
      if (mode === 'signup') {
        // Validate name
        nameSchema.parse(formData.name);
        
        // Validate password with comprehensive checks
        const passwordValidation = validatePassword(formData.password, formData.email, formData.name);
        if (!passwordValidation.valid) {
          toast.error(passwordValidation.error);
          setIsSubmitting(false);
          return;
        }
        
        if (!role) {
          toast.error('Please select a role');
          setIsSubmitting(false);
          return;
        }

        if (!formData.country) {
          toast.error('Please select your country');
          setIsSubmitting(false);
          return;
        }

        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.name, 
          role, 
          formData.company || undefined,
          formData.country
        );

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please log in instead.');
          } else {
            toast.error(getSafeErrorMessage(error, 'Failed to create account. Please try again.'));
          }
        } else {
          toast.success('Account created successfully!');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          const isLocked = recordFailedAttempt();
          const rateCheck = checkRateLimit();
          
          if (isLocked) {
            toast.error(`Too many failed attempts. Account locked for 15 minutes.`);
          } else if (error.message.includes('Invalid login credentials')) {
            toast.error(`Invalid email or password. ${rateCheck.remainingAttempts} attempt${rateCheck.remainingAttempts !== 1 ? 's' : ''} remaining.`);
          } else {
            toast.error(getSafeErrorMessage(error, 'Login failed. Please try again.'));
          }
        } else {
          clearRateLimit();
          toast.success('Welcome back!');
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueWithCurrentRole = () => {
    navigate('/select-role', { replace: true });
  };

  const handleSwitchRole = async () => {
    await signOut();
    setShowRoleSwitchWarning(false);
    setMode('signup');
    if (intendedRole) {
      setRole(intendedRole);
      setStep('details');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showRoleSwitchWarning && user && userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
              {intendedRole === 'carrier' ? (
                <Truck className="h-8 w-8 text-warning" />
              ) : (
                <Package className="h-8 w-8 text-warning" />
              )}
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
              Switch to {intendedRole === 'carrier' ? 'Carrier' : 'Shipper'}?
            </h2>
            <p className="text-muted-foreground mb-6">
              You're currently logged in as a <strong className="text-foreground capitalize">{userRole}</strong>. 
              To access the {intendedRole} side, you'll need to sign out and create a new account or log in with a different {intendedRole} account.
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleContinueWithCurrentRole}
              >
                Continue as {userRole}
              </Button>
              <Button 
                className="w-full" 
                variant={intendedRole === 'carrier' ? 'carrier' : 'shipper'}
                onClick={handleSwitchRole}
              >
                Sign out & switch to {intendedRole}
              </Button>
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="relative">
              <Truck className="h-10 w-10 text-primary-foreground" />
              <Package className="h-5 w-5 text-accent absolute -bottom-1 -right-1" />
            </div>
            <span className="font-heading font-bold text-2xl text-secondary-foreground">
              Freight<span className="text-accent">Share</span>
            </span>
          </Link>

          <h1 className="text-4xl font-heading font-bold text-secondary-foreground mb-4">
            Connect Directly.
            <br />
            <span className="text-accent">Ship Smarter.</span>
          </h1>

          <p className="text-secondary-foreground/70 text-lg max-w-md">
            The freight marketplace that connects shippers and carriers directly — with secure payments and transparent pricing.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-secondary-foreground/80">
              <div className="w-10 h-10 rounded-lg bg-secondary-foreground/10 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <span>Direct shipper-carrier connections</span>
            </div>
            <div className="flex items-center gap-3 text-secondary-foreground/80">
              <div className="w-10 h-10 rounded-lg bg-secondary-foreground/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span>Verified business partners</span>
            </div>
            <div className="flex items-center gap-3 text-secondary-foreground/80">
              <div className="w-10 h-10 rounded-lg bg-secondary-foreground/10 flex items-center justify-center">
                <Banknote className="h-5 w-5" />
              </div>
              <span>Secure in-platform payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="relative">
              <Truck className="h-8 w-8 text-primary" />
              <Package className="h-4 w-4 text-accent absolute -bottom-1 -right-1" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              Freight<span className="text-primary">Share</span>
            </span>
          </div>

          {step === 'role' ? (
            /* Role Selection — shown for both login and signup */
            <div className="animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                {mode === 'login' ? 'Welcome back' : 'Join FreightShare'}
              </h2>
              <p className="text-muted-foreground mb-8">
                {mode === 'login' 
                  ? 'How are you logging in today?' 
                  : 'Choose how you\'ll use the platform'}
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect('shipper')}
                  className="w-full p-6 rounded-xl border-2 border-border hover:border-shipper bg-card hover:bg-shipper/5 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-shipper/10 flex items-center justify-center group-hover:bg-shipper/20 transition-colors">
                      <Package className="h-6 w-6 text-shipper" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">I'm a Shipper</div>
                      <div className="text-sm text-muted-foreground">
                        {mode === 'login' ? 'Access your shipper dashboard' : 'Post loads and find carriers'}
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('carrier')}
                  className="w-full p-6 rounded-xl border-2 border-border hover:border-carrier bg-card hover:bg-carrier/5 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-carrier/10 flex items-center justify-center group-hover:bg-carrier/20 transition-colors">
                      <Truck className="h-6 w-6 text-carrier" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">I'm a Carrier</div>
                      <div className="text-sm text-muted-foreground">
                        {mode === 'login' ? 'Access your carrier dashboard' : 'Find loads and grow your business'}
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button 
                      onClick={() => { setMode('signup'); setStep('role'); setRole(null); }}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button 
                      onClick={() => { setMode('login'); setStep('role'); setRole(null); }}
                      className="text-primary hover:underline font-medium"
                    >
                      Log in
                    </button>
                  </>
                )}
              </p>
            </div>
          ) : (
            /* Auth Form */
            <div className="animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                {mode === 'login' 
                  ? `Log in as ${role === 'carrier' ? 'Carrier' : 'Shipper'}` 
                  : `Create your ${role || ''} account`}
              </h2>
              <p className="text-muted-foreground mb-8">
                {mode === 'login' 
                  ? 'Enter your credentials to access your dashboard'
                  : 'Fill in your details to get started'}
              </p>

              {role && (
                <button 
                  onClick={() => { setStep('role'); setRole(null); }}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Change role
                </button>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          disabled={isSubmitting}
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
                      <SchengenCountrySelect
                        value={formData.country}
                        onValueChange={(value) => setFormData({ ...formData, country: value })}
                        disabled={isSubmitting}
                        placeholder="Select your country"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <div className="relative mt-1">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="company"
                          type="text"
                          placeholder="Your Company Ltd"
                          className="pl-10"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          disabled={isSubmitting}
                          autoComplete="organization"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={isSubmitting}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === 'login' && (
                      <ForgotPasswordDialog />
                    )}
                  </div>
                  <div className="mt-1">
                    <PasswordInput
                      id="password"
                      value={formData.password}
                      onChange={(value) => setFormData({ ...formData, password: value })}
                      disabled={isSubmitting}
                      showRequirements={mode === 'signup'}
                      showStrength={mode === 'signup'}
                      email={formData.email}
                      name={formData.name}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  variant={role === 'carrier' ? 'carrier' : role === 'shipper' ? 'shipper' : 'default'}
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                    </>
                  ) : (
                    mode === 'login' ? 'Log In' : 'Create Account'
                  )}
                </Button>

                {/* Skip — Browse as guest (demo bypass) */}
                {mode === 'login' && role && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(role === 'carrier' ? '/dashboard/carrier' : '/dashboard/shipper')}
                      className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                    >
                      Skip — Browse as guest
                    </button>
                  </div>
                )}
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button 
                      onClick={() => { setMode('signup'); }}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button 
                      onClick={() => { setMode('login'); }}
                      className="text-primary hover:underline font-medium"
                    >
                      Log in
                    </button>
                  </>
                )}
              </p>

              {mode === 'signup' && (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="underline">Privacy Policy</Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
