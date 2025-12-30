-- Add route flexibility fields to routes table
ALTER TABLE public.routes 
ADD COLUMN IF NOT EXISTS open_to_extra_stops boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS flexibility_note text;

-- Add planned datetime to route_stops
ALTER TABLE public.route_stops 
ADD COLUMN IF NOT EXISTS planned_datetime timestamp with time zone;

-- Create deviation_requests table
CREATE TABLE public.deviation_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  shipper_id uuid NOT NULL,
  carrier_id uuid NOT NULL,
  pickup_address text NOT NULL,
  pallets_required integer NOT NULL,
  preferred_time_from timestamp with time zone NOT NULL,
  preferred_time_to timestamp with time zone NOT NULL,
  deviation_description text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'counter_offer')),
  carrier_response text,
  counter_offer_price numeric,
  counter_offer_conditions text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deviation_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for deviation_requests
CREATE POLICY "Shippers can create deviation requests"
ON public.deviation_requests
FOR INSERT
WITH CHECK (auth.uid() = shipper_id);

CREATE POLICY "Shippers can view own requests"
ON public.deviation_requests
FOR SELECT
USING (auth.uid() = shipper_id);

CREATE POLICY "Carriers can view requests for their routes"
ON public.deviation_requests
FOR SELECT
USING (auth.uid() = carrier_id);

CREATE POLICY "Carriers can update requests for their routes"
ON public.deviation_requests
FOR UPDATE
USING (auth.uid() = carrier_id);

CREATE POLICY "Shippers can view request status"
ON public.deviation_requests
FOR SELECT
USING (auth.uid() = shipper_id);

-- Add trigger for updated_at
CREATE TRIGGER update_deviation_requests_updated_at
BEFORE UPDATE ON public.deviation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();