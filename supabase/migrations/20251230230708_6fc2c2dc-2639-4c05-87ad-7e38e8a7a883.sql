-- Add capacity fields to loads table
ALTER TABLE public.loads 
ADD COLUMN space_type text NOT NULL DEFAULT 'epe',
ADD COLUMN space_value numeric NOT NULL DEFAULT 0,
ADD COLUMN space_ldm numeric,
ADD COLUMN weight_kg numeric NOT NULL DEFAULT 0,
ADD COLUMN length_cm numeric,
ADD COLUMN width_cm numeric,
ADD COLUMN height_cm numeric,
ADD COLUMN cargo_notes text;

-- Add capacity fields to routes table
ALTER TABLE public.routes
ADD COLUMN space_type text NOT NULL DEFAULT 'epe',
ADD COLUMN space_value numeric NOT NULL DEFAULT 0,
ADD COLUMN space_ldm numeric,
ADD COLUMN max_payload_kg numeric NOT NULL DEFAULT 0,
ADD COLUMN max_deviation_km numeric;

-- Add comments for documentation
COMMENT ON COLUMN public.loads.space_type IS 'Space unit type: epe, ldm, or dimensions';
COMMENT ON COLUMN public.loads.space_value IS 'Space value in the selected unit (EPE or LDM)';
COMMENT ON COLUMN public.loads.space_ldm IS 'Normalized space in Linear Loading Metres (calculated internally)';
COMMENT ON COLUMN public.loads.weight_kg IS 'Total shipment weight in kilograms';
COMMENT ON COLUMN public.loads.length_cm IS 'Cargo length in cm (for dimensions mode)';
COMMENT ON COLUMN public.loads.width_cm IS 'Cargo width in cm (for dimensions mode)';
COMMENT ON COLUMN public.loads.height_cm IS 'Cargo height in cm (for dimensions mode)';
COMMENT ON COLUMN public.loads.cargo_notes IS 'Notes about cargo handling (stackable, fragile, etc.)';

COMMENT ON COLUMN public.routes.space_type IS 'Available space unit type: epe or ldm';
COMMENT ON COLUMN public.routes.space_value IS 'Available space value in the selected unit';
COMMENT ON COLUMN public.routes.space_ldm IS 'Available space in Linear Loading Metres (calculated internally)';
COMMENT ON COLUMN public.routes.max_payload_kg IS 'Maximum additional payload in kilograms';
COMMENT ON COLUMN public.routes.max_deviation_km IS 'Maximum deviation from route in kilometers';