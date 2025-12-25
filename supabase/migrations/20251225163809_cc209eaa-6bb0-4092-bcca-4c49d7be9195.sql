-- Drop the existing ratings table if needed and recreate with detailed categories
-- First, create a new detailed_ratings table with multi-dimensional rating categories

CREATE TABLE public.detailed_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id),
  rater_id UUID NOT NULL,
  rated_id UUID NOT NULL,
  rater_role TEXT NOT NULL CHECK (rater_role IN ('shipper', 'carrier')),
  
  -- Rating categories (1-5 scale)
  timeliness_score INTEGER NOT NULL CHECK (timeliness_score >= 1 AND timeliness_score <= 5),
  communication_score INTEGER NOT NULL CHECK (communication_score >= 1 AND communication_score <= 5),
  reliability_score INTEGER NOT NULL CHECK (reliability_score >= 1 AND reliability_score <= 5),
  accuracy_score INTEGER NOT NULL CHECK (accuracy_score >= 1 AND accuracy_score <= 5),
  
  -- Overall computed score (average)
  overall_score NUMERIC(2,1) GENERATED ALWAYS AS (
    (timeliness_score + communication_score + reliability_score + accuracy_score)::NUMERIC / 4
  ) STORED,
  
  -- Optional comment
  comment TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one rating per party per shipment
  UNIQUE(shipment_id, rater_id, rated_id)
);

-- Enable RLS
ALTER TABLE public.detailed_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Ratings are viewable by everyone"
ON public.detailed_ratings FOR SELECT
USING (true);

CREATE POLICY "Shipment parties can create ratings"
ON public.detailed_ratings FOR INSERT
WITH CHECK (
  auth.uid() = rater_id AND
  EXISTS (
    SELECT 1 FROM shipments
    WHERE shipments.id = detailed_ratings.shipment_id
    AND shipments.status = 'completed'
    AND (shipments.shipper_id = auth.uid() OR shipments.carrier_id = auth.uid())
  )
);

-- Add vehicle_type column to routes table for mandatory vehicle selection
ALTER TABLE public.routes 
ADD COLUMN IF NOT EXISTS vehicle_type TEXT;

-- Create enum for vehicle types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type') THEN
    CREATE TYPE vehicle_type AS ENUM (
      'standard_truck',
      'refrigerated_truck',
      'flatbed',
      'box_truck',
      'curtain_sider',
      'tanker',
      'livestock_carrier',
      'car_transporter'
    );
  END IF;
END $$;

-- Add departure_time column for exact departure time
ALTER TABLE public.routes
ADD COLUMN IF NOT EXISTS departure_time TIME;

-- Create cargo-vehicle compatibility reference table
CREATE TABLE IF NOT EXISTS public.cargo_vehicle_compatibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cargo_type TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  is_compatible BOOLEAN NOT NULL DEFAULT true,
  compatibility_note TEXT,
  UNIQUE(cargo_type, vehicle_type)
);

-- Enable RLS on compatibility table
ALTER TABLE public.cargo_vehicle_compatibility ENABLE ROW LEVEL SECURITY;

-- Make compatibility table readable by everyone
CREATE POLICY "Compatibility is viewable by everyone"
ON public.cargo_vehicle_compatibility FOR SELECT
USING (true);

-- Insert compatibility matrix
INSERT INTO public.cargo_vehicle_compatibility (cargo_type, vehicle_type, is_compatible, compatibility_note) VALUES
-- General cargo
('general', 'standard_truck', true, NULL),
('general', 'refrigerated_truck', true, NULL),
('general', 'flatbed', true, NULL),
('general', 'box_truck', true, NULL),
('general', 'curtain_sider', true, NULL),
('general', 'tanker', false, 'Not suitable for general cargo'),
('general', 'livestock_carrier', false, 'Not suitable for general cargo'),
('general', 'car_transporter', false, 'Not suitable for general cargo'),
-- Fragile cargo
('fragile', 'standard_truck', true, NULL),
('fragile', 'refrigerated_truck', true, NULL),
('fragile', 'flatbed', false, 'Fragile items need enclosed transport'),
('fragile', 'box_truck', true, 'Ideal for fragile items'),
('fragile', 'curtain_sider', true, NULL),
('fragile', 'tanker', false, 'Not suitable for fragile cargo'),
('fragile', 'livestock_carrier', false, 'Not suitable for fragile cargo'),
('fragile', 'car_transporter', false, 'Not suitable for fragile cargo'),
-- Refrigerated cargo
('refrigerated', 'standard_truck', false, 'Requires temperature control'),
('refrigerated', 'refrigerated_truck', true, 'Required for refrigerated cargo'),
('refrigerated', 'flatbed', false, 'Requires temperature control'),
('refrigerated', 'box_truck', false, 'Requires temperature control'),
('refrigerated', 'curtain_sider', false, 'Requires temperature control'),
('refrigerated', 'tanker', false, 'Requires temperature control'),
('refrigerated', 'livestock_carrier', false, 'Requires temperature control'),
('refrigerated', 'car_transporter', false, 'Requires temperature control'),
-- Hazardous cargo
('hazardous', 'standard_truck', true, 'ADR certification required'),
('hazardous', 'refrigerated_truck', false, 'Not certified for hazmat'),
('hazardous', 'flatbed', true, 'ADR certification required'),
('hazardous', 'box_truck', true, 'ADR certification required'),
('hazardous', 'curtain_sider', true, 'ADR certification required'),
('hazardous', 'tanker', true, 'Often used for hazardous liquids'),
('hazardous', 'livestock_carrier', false, 'Not suitable for hazardous cargo'),
('hazardous', 'car_transporter', false, 'Not suitable for hazardous cargo'),
-- Oversized cargo
('oversized', 'standard_truck', false, 'Insufficient for oversized cargo'),
('oversized', 'refrigerated_truck', false, 'Insufficient for oversized cargo'),
('oversized', 'flatbed', true, 'Ideal for oversized cargo'),
('oversized', 'box_truck', false, 'Insufficient for oversized cargo'),
('oversized', 'curtain_sider', true, 'Can accommodate some oversized cargo'),
('oversized', 'tanker', false, 'Not suitable for oversized cargo'),
('oversized', 'livestock_carrier', false, 'Not suitable for oversized cargo'),
('oversized', 'car_transporter', false, 'Not suitable for oversized cargo'),
-- Livestock
('livestock', 'standard_truck', false, 'Not suitable for livestock'),
('livestock', 'refrigerated_truck', false, 'Not suitable for livestock'),
('livestock', 'flatbed', false, 'Not suitable for livestock'),
('livestock', 'box_truck', false, 'Not suitable for livestock'),
('livestock', 'curtain_sider', false, 'Not suitable for livestock'),
('livestock', 'tanker', false, 'Not suitable for livestock'),
('livestock', 'livestock_carrier', true, 'Required for livestock transport'),
('livestock', 'car_transporter', false, 'Not suitable for livestock'),
-- Vehicles
('vehicles', 'standard_truck', false, 'Not suitable for vehicle transport'),
('vehicles', 'refrigerated_truck', false, 'Not suitable for vehicle transport'),
('vehicles', 'flatbed', true, 'Can carry some vehicles'),
('vehicles', 'box_truck', false, 'Not suitable for vehicle transport'),
('vehicles', 'curtain_sider', false, 'Not suitable for vehicle transport'),
('vehicles', 'tanker', false, 'Not suitable for vehicle transport'),
('vehicles', 'livestock_carrier', false, 'Not suitable for vehicle transport'),
('vehicles', 'car_transporter', true, 'Required for vehicle transport'),
-- Other cargo
('other', 'standard_truck', true, NULL),
('other', 'refrigerated_truck', true, NULL),
('other', 'flatbed', true, NULL),
('other', 'box_truck', true, NULL),
('other', 'curtain_sider', true, NULL),
('other', 'tanker', false, 'Contact carrier for special requirements'),
('other', 'livestock_carrier', false, 'Contact carrier for special requirements'),
('other', 'car_transporter', false, 'Contact carrier for special requirements')
ON CONFLICT (cargo_type, vehicle_type) DO NOTHING;