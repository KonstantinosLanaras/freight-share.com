import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { RatingDisplay } from '@/components/ratings/RatingDisplay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  verification_status: VerificationStatus | null;
}

interface Props {
  userId: string | null | undefined;
  role: 'shipper' | 'carrier';
  variant?: 'inline' | 'card';
  showRating?: boolean;
  showLink?: boolean;
  className?: string;
}

/**
 * Unified counterparty identity block. Shows avatar, name, verification badge,
 * average rating (from ratings table), and a link to the full profile.
 * Use everywhere a shipper interacts with a carrier or vice versa.
 */
export function CounterpartyCard({
  userId,
  role,
  variant = 'card',
  showRating = true,
  showLink = true,
  className,
}: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ratingAvg, setRatingAvg] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setLoading(false);
      return;
    }
    (async () => {
      const [{ data: p }, { data: ratings }] = await Promise.all([
        supabase
          .from('public_profiles')
          .select('id, full_name, company_name, avatar_url, verification_status')
          .eq('id', userId)
          .maybeSingle(),
        showRating
          ? supabase.from('ratings').select('score').eq('rated_id', userId)
          : Promise.resolve({ data: null as { score: number }[] | null }),
      ]);
      if (cancelled) return;
      setProfile((p as Profile) ?? null);
      if (ratings && ratings.length > 0) {
        const avg = ratings.reduce((s, r) => s + Number(r.score), 0) / ratings.length;
        setRatingAvg(avg);
        setRatingCount(ratings.length);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, showRating]);

  if (!userId) return null;

  const roleLabel = role === 'carrier' ? 'Carrier' : 'Shipper';
  const displayName =
    profile?.company_name || profile?.full_name || (loading ? '' : roleLabel);
  const initials = (displayName || roleLabel)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const content = (
    <>
      <Avatar className={variant === 'inline' ? 'h-8 w-8' : 'h-11 w-11'}>
        {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
        <AvatarFallback className="text-xs">{initials || '?'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {loading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span className="font-medium text-foreground truncate">{displayName}</span>
          )}
          {profile?.verification_status && (
            <VerificationBadge status={profile.verification_status} size="sm" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{roleLabel}</span>
          {showRating && ratingAvg !== null && (
            <>
              <span>·</span>
              <RatingDisplay
                overallScore={ratingAvg}
                ratingsCount={ratingCount}
                size="sm"
              />
            </>
          )}
          {showRating && ratingAvg === null && !loading && (
            <>
              <span>·</span>
              <span className="italic">No ratings yet</span>
            </>
          )}
        </div>
      </div>
      {showLink && variant === 'card' && (
        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
    </>
  );

  const baseClass = cn(
    'flex items-center gap-3',
    variant === 'card' &&
      'p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors',
    className
  );

  if (showLink) {
    return (
      <Link to={`/profile/${role}/${userId}`} className={baseClass}>
        {content}
      </Link>
    );
  }
  return <div className={baseClass}>{content}</div>;
}
