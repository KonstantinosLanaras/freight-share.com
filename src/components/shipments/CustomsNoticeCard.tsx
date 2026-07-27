import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface CustomsNoticeCardProps {
  originCountry: string | null | undefined;
  destinationCountry: string | null | undefined;
  cargoType?: string | null;
}

interface ChecklistItem {
  title: string;
  appliesWhen: string;
}

const CUSTOMS_CHECKLIST: ChecklistItem[] = [
  {
    title: 'Customs declaration (e.g. a T1 transit document, or export/entry summary filings)',
    appliesWhen: 'generally applies when a shipment crosses a customs boundary — for example, moves involving the UK, Switzerland, Norway, or a non-EU Balkan country.',
  },
  {
    title: 'EORI number',
    appliesWhen: 'generally required for businesses making customs declarations in the EU.',
  },
  {
    title: 'EUR.1 movement certificate or origin declaration',
    appliesWhen: 'applies only where preferential tariff treatment is being claimed under a trade agreement.',
  },
];

const ADR_CHECKLIST: ChecklistItem = {
  title: 'ADR transport documents and driver/vehicle certification',
  appliesWhen: "applies to goods classified as dangerous/hazardous under the European Agreement concerning the International Carriage of Dangerous Goods by Road (ADR).",
};

/**
 * An unfiltered reference list, not a determination of what this specific
 * shipment requires. FreightShare doesn't compute which of these apply --
 * that would mean owning the consequences of getting it wrong. The trigger
 * for showing this card is deliberately a plain fact already entered by the
 * parties (origin/destination differ, or cargo is marked hazardous), not a
 * legal judgment about customs-union membership or ADR classification.
 */
export function CustomsNoticeCard({ originCountry, destinationCountry, cargoType }: CustomsNoticeCardProps) {
  const isInternational = !!originCountry && !!destinationCountry && originCountry !== destinationCountry;
  const isHazardous = cargoType === 'hazardous';

  if (!isInternational && !isHazardous) return null;

  const items = [
    ...(isInternational ? CUSTOMS_CHECKLIST : []),
    ...(isHazardous ? [ADR_CHECKLIST] : []),
  ];

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-warning">
          <Info className="h-4 w-4" />
          Documentation that can apply to shipments like this
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          This is general information, not a determination of what this specific shipment requires.
          FreightShare doesn't file customs declarations or issue origin/ADR certificates — those come from a customs broker, the relevant customs authority, or a chamber of commerce.
        </p>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.title} className="border-l-2 border-warning/40 pl-3">
              <div className="font-medium text-foreground">{item.title}</div>
              <div className="text-muted-foreground">{item.appliesWhen}</div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground pt-1">
          Whether any of these actually apply depends on the specific goods and countries involved — verify with a customs broker or qualified counsel in the relevant jurisdictions before this shipment moves.
        </p>
      </CardContent>
    </Card>
  );
}
