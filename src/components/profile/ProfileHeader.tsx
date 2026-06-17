import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Clock, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface Props {
  companyName: string;
  logoUrl?: string | null;
  memberSince?: string | null;
  countries?: string[]; // ISO2 codes
  bio?: string | null;
  verified?: boolean;
  vatPending?: boolean;
  profileComplete?: boolean;
}

function flagEmoji(country: string) {
  if (!country || country.length !== 2) return "🏳️";
  const code = country.toUpperCase();
  return String.fromCodePoint(...code.split("").map((c) => 127397 + c.charCodeAt(0)));
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProfileHeader({
  companyName,
  logoUrl,
  memberSince,
  countries = [],
  bio,
  verified,
  vatPending,
  profileComplete,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      <Avatar className="h-24 w-24">
        {logoUrl && <AvatarImage src={logoUrl} alt={companyName} />}
        <AvatarFallback className="text-2xl">{initials(companyName || "?")}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{companyName || "Unnamed company"}</h1>
          {verified && (
            <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified
            </Badge>
          )}
          {!verified && vatPending && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30 gap-1">
              <Clock className="h-3.5 w-3.5" /> Verification Pending
            </Badge>
          )}
          {profileComplete && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Profile Complete
            </Badge>
          )}
        </div>
        <div className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
          {memberSince && <span>Member since {format(new Date(memberSince), "MMM yyyy")}</span>}
          {countries.length > 0 && (
            <span className="flex items-center gap-1">
              {countries.map((c) => (
                <span key={c} title={c} className="text-base leading-none">
                  {flagEmoji(c)}
                </span>
              ))}
            </span>
          )}
        </div>
        {bio && <p className="mt-3 text-sm text-foreground/80 max-w-2xl">{bio}</p>}
      </div>
    </div>
  );
}
