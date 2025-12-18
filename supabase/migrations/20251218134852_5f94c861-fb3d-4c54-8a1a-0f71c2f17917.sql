-- Create route status enum
CREATE TYPE public.route_status AS ENUM ('planned', 'active', 'completed', 'cancelled');

-- Add new columns to routes table
ALTER TABLE public.routes
ADD COLUMN status public.route_status NOT NULL DEFAULT 'planned',
ADD COLUMN arrival_date_from date,
ADD COLUMN arrival_date_to date,
ADD COLUMN vehicle_constraints text,
ADD COLUMN notes text;

-- Create index on status for filtering
CREATE INDEX idx_routes_status ON public.routes(status);

-- Create function to match loads to routes
CREATE OR REPLACE FUNCTION public.get_matching_routes_for_load(
  p_origin_city text,
  p_origin_country text,
  p_destination_city text,
  p_destination_country text,
  p_pickup_date_from date,
  p_pickup_date_to date,
  p_pallets integer
)
RETURNS TABLE (
  route_id uuid,
  carrier_id uuid,
  origin_city text,
  origin_country text,
  destination_city text,
  destination_country text,
  departure_date_from date,
  departure_date_to date,
  available_pallets integer,
  status route_status,
  match_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  -- Direct route matches (origin to destination)
  SELECT 
    r.id as route_id,
    r.carrier_id,
    r.origin_city,
    r.origin_country,
    r.destination_city,
    r.destination_country,
    r.departure_date_from,
    r.departure_date_to,
    r.available_pallets,
    r.status,
    'direct'::text as match_type
  FROM routes r
  WHERE r.status IN ('planned', 'active')
    AND r.available_pallets >= p_pallets
    AND r.origin_country = p_origin_country
    AND r.destination_country = p_destination_country
    AND r.departure_date_from <= p_pickup_date_to
    AND r.departure_date_to >= p_pickup_date_from
  
  UNION
  
  -- Matches via intermediate stops (origin matches a stop)
  SELECT 
    r.id as route_id,
    r.carrier_id,
    r.origin_city,
    r.origin_country,
    r.destination_city,
    r.destination_country,
    r.departure_date_from,
    r.departure_date_to,
    LEAST(r.available_pallets, rs.available_pallets) as available_pallets,
    r.status,
    'via_stop'::text as match_type
  FROM routes r
  JOIN route_stops rs ON rs.route_id = r.id
  WHERE r.status IN ('planned', 'active')
    AND LEAST(r.available_pallets, rs.available_pallets) >= p_pallets
    AND rs.country = p_origin_country
    AND r.destination_country = p_destination_country
    AND r.departure_date_from <= p_pickup_date_to
    AND r.departure_date_to >= p_pickup_date_from
  
  UNION
  
  -- Matches where destination is an intermediate stop
  SELECT 
    r.id as route_id,
    r.carrier_id,
    r.origin_city,
    r.origin_country,
    r.destination_city,
    r.destination_country,
    r.departure_date_from,
    r.departure_date_to,
    LEAST(r.available_pallets, rs.available_pallets) as available_pallets,
    r.status,
    'to_stop'::text as match_type
  FROM routes r
  JOIN route_stops rs ON rs.route_id = r.id
  WHERE r.status IN ('planned', 'active')
    AND LEAST(r.available_pallets, rs.available_pallets) >= p_pallets
    AND r.origin_country = p_origin_country
    AND rs.country = p_destination_country
    AND r.departure_date_from <= p_pickup_date_to
    AND r.departure_date_to >= p_pickup_date_from;
END;
$$;

-- Create function to match routes to loads
CREATE OR REPLACE FUNCTION public.get_matching_loads_for_route(
  p_route_id uuid
)
RETURNS TABLE (
  load_id uuid,
  shipper_id uuid,
  origin_city text,
  origin_country text,
  destination_city text,
  destination_country text,
  pickup_date_from date,
  pickup_date_to date,
  pallets integer,
  price numeric,
  pricing_type text,
  match_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_route routes%ROWTYPE;
BEGIN
  SELECT * INTO v_route FROM routes WHERE id = p_route_id;
  
  IF v_route IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  -- Direct matches
  SELECT 
    l.id as load_id,
    l.shipper_id,
    l.origin_city,
    l.origin_country,
    l.destination_city,
    l.destination_country,
    l.pickup_date_from,
    l.pickup_date_to,
    l.pallets,
    l.price,
    l.pricing_type::text,
    'direct'::text as match_type
  FROM loads l
  WHERE l.status = 'posted'
    AND l.pallets <= v_route.available_pallets
    AND l.origin_country = v_route.origin_country
    AND l.destination_country = v_route.destination_country
    AND l.pickup_date_from <= v_route.departure_date_to
    AND l.pickup_date_to >= v_route.departure_date_from
  
  UNION
  
  -- Matches via intermediate stops
  SELECT 
    l.id as load_id,
    l.shipper_id,
    l.origin_city,
    l.origin_country,
    l.destination_city,
    l.destination_country,
    l.pickup_date_from,
    l.pickup_date_to,
    l.pallets,
    l.price,
    l.pricing_type::text,
    'via_stop'::text as match_type
  FROM loads l
  JOIN route_stops rs ON rs.route_id = v_route.id
  WHERE l.status = 'posted'
    AND l.pallets <= LEAST(v_route.available_pallets, rs.available_pallets)
    AND (l.origin_country = rs.country OR l.destination_country = rs.country)
    AND l.pickup_date_from <= v_route.departure_date_to
    AND l.pickup_date_to >= v_route.departure_date_from;
END;
$$;