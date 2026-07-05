import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle, MailX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State = 'loading' | 'valid' | 'already' | 'invalid' | 'confirming' | 'done' | 'error';

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    (async () => {
      try {
        const r = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } }
        );
        const j = await r.json();
        if (!r.ok) { setState('invalid'); return; }
        if (j.valid === false && j.reason === 'already_unsubscribed') { setState('already'); return; }
        setState('valid');
      } catch { setState('error'); }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState('confirming');
    const { data, error } = await supabase.functions.invoke('handle-email-unsubscribe', { body: { token } });
    if (error) return setState('error');
    if ((data as any)?.reason === 'already_unsubscribed') return setState('already');
    setState('done');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
            <MailX className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Unsubscribe</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {state === 'loading' && <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />}
          {state === 'valid' && (
            <>
              <p className="text-muted-foreground">
                Click below to stop receiving notification emails from ReRoute.
              </p>
              <Button onClick={confirm} className="w-full">Confirm unsubscribe</Button>
            </>
          )}
          {state === 'confirming' && <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />}
          {state === 'done' && (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 text-success mx-auto" />
              <p>You've been unsubscribed. You will no longer receive these emails.</p>
            </div>
          )}
          {state === 'already' && (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 text-success mx-auto" />
              <p>This email is already unsubscribed.</p>
            </div>
          )}
          {(state === 'invalid' || state === 'error') && (
            <div className="space-y-2">
              <XCircle className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-muted-foreground">This unsubscribe link is invalid or has expired.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
