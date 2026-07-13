import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { validatePassword } from '@/lib/validationSchemas';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

type Status = 'checking' | 'ready' | 'invalid' | 'saving' | 'done';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Supabase places recovery tokens in the URL hash. The Supabase JS client
    // auto-detects the hash and creates a temporary session for password update.
    const hash = window.location.hash || '';
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const type = params.get('type');
    const errorDescription = params.get('error_description');

    if (errorDescription) {
      setStatus('invalid');
      return;
    }

    // Give the client a moment to process the hash and establish a recovery session.
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session || type === 'recovery') {
        setStatus('ready');
      } else {
        setStatus('invalid');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePassword(password);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter them.');
      return;
    }

    setStatus('saving');
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error('Password update error:', error);
      toast.error(error.message || 'Could not update your password. Please try again.');
      setStatus('ready');
      return;
    }

    // Sign out so the user has to log in with the new password on their own device.
    await supabase.auth.signOut();
    setStatus('done');
    toast.success('Password updated. Please log in with your new password.');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md">
          {status === 'checking' && (
            <CardContent className="py-10 flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
            </CardContent>
          )}

          {status === 'invalid' && (
            <>
              <CardHeader className="items-center text-center">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                  <ShieldAlert className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Reset link invalid or expired</CardTitle>
                <CardDescription>
                  Password reset links expire after a short time and can only be used once. Please request a new one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate('/auth')}>Back to sign in</Button>
              </CardContent>
            </>
          )}

          {status === 'done' && (
            <>
              <CardHeader className="items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Password updated</CardTitle>
                <CardDescription>You can now log in with your new password.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate('/auth')}>Go to sign in</Button>
              </CardContent>
            </>
          )}

          {(status === 'ready' || status === 'saving') && (
            <>
              <CardHeader>
                <CardTitle>Set a new password</CardTitle>
                <CardDescription>
                  Choose a strong password for your FreightShare account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="new-password">New password</Label>
                    <PasswordInput
                      id="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      showStrength
                      showRequirements
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <PasswordInput
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={status === 'saving'}>
                    {status === 'saving' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      'Update password'
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
