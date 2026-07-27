// EU Customs Union membership -- deliberately NOT the same list as
// Schengen (schengenCountries.ts). Switzerland, Norway, Iceland, and
// Liechtenstein are Schengen but outside the EU customs union; Cyprus is
// in the customs union but outside Schengen. This distinction is what
// actually determines whether a movement needs customs paperwork.
//
// Used only to decide whether CustomsNoticeCard is shown at all -- a
// deliberate choice to trade the earlier "always show for any
// cross-border move" design (which never requires this list to be
// correct, but shows an irrelevant notice on pure intra-EU routes) for a
// more precise trigger. The card's own text stays hedged/informational
// regardless ("generally applies when...", not "this shipment requires
// ..."); only visibility depends on this list being accurate. If it has
// a gap, the risk shifts from "shown when unnecessary" to "not shown
// when it should have been" -- keep it current if EU membership changes.
const EU_CUSTOMS_UNION_COUNTRY_NAMES = new Set<string>([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden',
]);

export function isEuCustomsUnionCountry(countryName: string): boolean {
  return EU_CUSTOMS_UNION_COUNTRY_NAMES.has(countryName);
}

/**
 * True when a move crosses the EU customs boundary -- one side is inside
 * the customs union and the other isn't (or neither is, e.g. UK<->Switzerland).
 * Doesn't special-case Monaco/San Marino/Andorra's partial customs
 * arrangements with the EU; treated as outside the union, which is the
 * conservative (more likely to show the notice, not less) direction.
 */
export function crossesCustomsBorder(originCountry: string | null | undefined, destinationCountry: string | null | undefined): boolean {
  if (!originCountry || !destinationCountry) return false;
  if (originCountry === destinationCountry) return false;
  return isEuCustomsUnionCountry(originCountry) !== isEuCustomsUnionCountry(destinationCountry);
}
