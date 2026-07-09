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

GRANT SELECT ON public.cities TO anon, authenticated;
GRANT ALL ON public.cities TO service_role;

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cities"
  ON public.cities FOR SELECT
  USING (true);

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