import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileWarning } from 'lucide-react';
import { crossesCustomsBorder } from '@/lib/customsUnion';

interface CustomsNoticeCardProps {
  originCountry: string | null | undefined;
  destinationCountry: string | null | undefined;
  cargoType?: string | null;
}

/**
 * Warns the parties that extra paperwork may be needed -- FreightShare
 * doesn't file customs declarations or issue ADR/origin certificates,
 * those come from a customs broker, the relevant authority, or a
 * chamber of commerce, so this is a checklist, not a generated document.
 */
export function CustomsNoticeCard({ originCountry, destinationCountry, cargoType }: CustomsNoticeCardProps) {
  const isCustomsMove = crossesCustomsBorder(originCountry, destinationCountry);
  const isHazardous = cargoType === 'hazardous';

  if (!isCustomsMove && !isHazardous) return null;

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-warning">
          <FileWarning className="h-4 w-4" />
          Extra documentation may be required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isCustomsMove && (
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">{originCountry} → {destinationCountry} crosses the EU customs boundary.</span>{' '}
              This shipment needs a customs declaration (e.g. a T1 transit document, or export/entry summary filings) arranged through a customs broker, plus an EORI number for both parties.
              If preferential tariff treatment is being claimed under a trade agreement, a EUR.1 movement certificate or origin declaration is also needed.
              FreightShare doesn't file these on your behalf — they must be arranged directly with a customs broker or the relevant authority.
            </p>
          </div>
        )}
        {isHazardous && (
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">This cargo is classified as hazardous.</span>{' '}
              Carriage is subject to ADR (the European Agreement concerning the International Carriage of Dangerous Goods by Road) — the carrier must hold valid ADR driver/vehicle certification and the correct transport documents for the goods' UN class. FreightShare doesn't verify ADR compliance; confirm it directly with the carrier before this shipment moves.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
