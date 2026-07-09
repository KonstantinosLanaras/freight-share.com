// Generates a Supabase migration seeding public.cities from the European
// city dictionary built in freightshare-mvp (GeoNames cities15000.txt, filtered
// to EU+EEA+UK+CH+Balkans). Also adds nullable lat/lng columns to loads/routes.
// Usage: node scripts/generate-cities-migration.mjs /path/to/cities-europe.json
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/generate-cities-migration.mjs /path/to/cities-europe.json');
  process.exit(1);
}

const cities = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

function sqlString(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

const valuesSql = cities
  .map(c => `(${c.geonameId}, ${sqlString(c.name)}, ${sqlString(c.asciiName)}, ${sqlString(c.country)}, ${c.lat}, ${c.lng}, ${c.population}, ${sqlString(c.altNames.join(','))})`)
  .join(',\n  ');

const sql = `-- European city dictionary (GeoNames cities15000.txt, filtered to EU+EEA+UK+CH+Balkans,
-- population >= 15000). Powers city autocomplete and Haversine distance-based
-- proximity matching between loads and routes.

CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geoname_id integer NOT NULL UNIQUE,
  name text NOT NULL,
  ascii_name text NOT NULL,
  country text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  population integer NOT NULL,
  alt_names text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cities_name_lower ON public.cities (lower(name));
CREATE INDEX idx_cities_ascii_name_lower ON public.cities (lower(ascii_name));

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cities"
  ON public.cities FOR SELECT
  USING (true);

INSERT INTO public.cities (geoname_id, name, ascii_name, country, lat, lng, population, alt_names) VALUES
  ${valuesSql}
ON CONFLICT (geoname_id) DO NOTHING;

-- Nullable coordinates for existing free-text city columns. NULL for rows
-- posted before this migration; populated going forward via CityCombobox.
ALTER TABLE public.loads
  ADD COLUMN IF NOT EXISTS origin_lat numeric,
  ADD COLUMN IF NOT EXISTS origin_lng numeric,
  ADD COLUMN IF NOT EXISTS destination_lat numeric,
  ADD COLUMN IF NOT EXISTS destination_lng numeric;

ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS origin_lat numeric,
  ADD COLUMN IF NOT EXISTS origin_lng numeric,
  ADD COLUMN IF NOT EXISTS destination_lat numeric,
  ADD COLUMN IF NOT EXISTS destination_lng numeric;
`;

const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const uuid = crypto.randomUUID();
const outPath = path.join(__dirname, '..', 'supabase', 'migrations', `${ts}_${uuid}.sql`);
fs.writeFileSync(outPath, sql);
console.log(`Wrote migration with ${cities.length} cities to ${outPath}`);
