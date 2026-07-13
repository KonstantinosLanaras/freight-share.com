import { SCHENGEN_COUNTRIES } from './schengenCountries';

// Countries in the city dictionary (EU+EEA+UK+CH+Balkans) that fall outside
// the Schengen list above and so need a name supplied separately.
const EXTRA_COUNTRY_NAMES: Record<string, string> = {
  AD: 'Andorra',
  AL: 'Albania',
  BA: 'Bosnia and Herzegovina',
  CY: 'Cyprus',
  GB: 'United Kingdom',
  MC: 'Monaco',
  ME: 'Montenegro',
  MK: 'North Macedonia',
  RS: 'Serbia',
  SM: 'San Marino',
  VA: 'Vatican City',
  XK: 'Kosovo',
};

const SCHENGEN_NAME_BY_CODE: Record<string, string> = Object.fromEntries(
  SCHENGEN_COUNTRIES.map((c) => [c.code, c.name])
);

export const COUNTRY_NAME_BY_CODE: Record<string, string> = {
  ...SCHENGEN_NAME_BY_CODE,
  ...EXTRA_COUNTRY_NAMES,
};

export function countryNameFromCode(code: string): string {
  return COUNTRY_NAME_BY_CODE[code] || code;
}

export function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}
