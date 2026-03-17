import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Calendar, Building2, FileText } from 'lucide-react';
import { InsuranceBadge, type InsuranceStatus } from './InsuranceBadge';
import { format } from 'date-fns';

interface InsuranceSummaryCardProps {
  insurance: {
    provider_name: string;
    coverage_type: string;
    coverage_limit_eur: number;
    expiration_date: string;
    status: string;
    policy_number?: string | null;
  } | null;
  compact?: boolean;
}

export function InsuranceSummaryCard({ insurance, compact = false }: InsuranceSummaryCardProps) {
  if (!insurance) {
    return (
      <Card className="border-muted">
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm">No insurance information provided</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isExpired = new Date(insurance.expiration_date) < new Date();
  const insuranceStatus: InsuranceStatus = insurance.status === 'verified' ? 'verified' : 'provided';

  if (compact) {
    return (
      <div className="space-y-2">
        <InsuranceBadge status={insuranceStatus} coverageLimitEur={insurance.coverage_limit_eur} size="sm" />
        {isExpired && (
          <p className="text-xs text-destructive">⚠ Insurance expired</p>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Carrier Insurance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <InsuranceBadge status={insuranceStatus} coverageLimitEur={insurance.coverage_limit_eur} />
        
        <div className="grid gap-2 pt-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Provider:</span>
            <span className="font-medium text-foreground">{insurance.provider_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Coverage:</span>
            <span className="font-medium text-foreground capitalize">{insurance.coverage_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className={`h-3.5 w-3.5 ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`} />
            <span className="text-muted-foreground">Expires:</span>
            <span className={`font-medium ${isExpired ? 'text-destructive' : 'text-foreground'}`}>
              {format(new Date(insurance.expiration_date), 'MMM d, yyyy')}
              {isExpired && ' (Expired)'}
            </span>
          </div>
        </div>

        {/* Legal disclaimer */}
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            The carrier is responsible for transport and cargo insurance. Freight Share acts as a platform connecting shippers and carriers and does not provide transport services.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
