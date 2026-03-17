
-- Add new columns to routes table
ALTER TABLE public.routes 
  ADD COLUMN IF NOT EXISTS max_destination_radius_km numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trip_description text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS itinerary_image_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS route_link text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS goods_accepted text DEFAULT NULL;

-- Create request_status enum
DO $$ BEGIN
  CREATE TYPE public.route_request_status AS ENUM ('sent', 'viewed', 'in_discussion', 'accepted', 'rejected', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create route_requests table
CREATE TABLE public.route_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  shipper_id uuid NOT NULL,
  carrier_id uuid NOT NULL,
  pickup_address text NOT NULL,
  delivery_address text NOT NULL,
  goods_type text NOT NULL,
  weight_kg numeric NOT NULL DEFAULT 0,
  volume_cbm numeric DEFAULT NULL,
  pallets integer NOT NULL DEFAULT 1,
  shipment_date date NOT NULL,
  special_requirements text DEFAULT NULL,
  message text DEFAULT NULL,
  status public.route_request_status NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.route_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for route_requests
CREATE POLICY "Shippers can create requests"
  ON public.route_requests FOR INSERT
  WITH CHECK (auth.uid() = shipper_id);

CREATE POLICY "Shippers can view own requests"
  ON public.route_requests FOR SELECT
  USING (auth.uid() = shipper_id);

CREATE POLICY "Carriers can view requests for their routes"
  ON public.route_requests FOR SELECT
  USING (auth.uid() = carrier_id);

CREATE POLICY "Carriers can update requests"
  ON public.route_requests FOR UPDATE
  USING (auth.uid() = carrier_id);

CREATE POLICY "Shippers can update own requests"
  ON public.route_requests FOR UPDATE
  USING (auth.uid() = shipper_id);

-- Create route_request_messages table
CREATE TABLE public.route_request_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.route_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.route_request_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Request parties can view messages"
  ON public.route_request_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.route_requests rr
    WHERE rr.id = route_request_messages.request_id
    AND (rr.shipper_id = auth.uid() OR rr.carrier_id = auth.uid())
  ));

CREATE POLICY "Request parties can send messages"
  ON public.route_request_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND EXISTS (
      SELECT 1 FROM public.route_requests rr
      WHERE rr.id = route_request_messages.request_id
      AND (rr.shipper_id = auth.uid() OR rr.carrier_id = auth.uid())
    )
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.route_request_messages;

-- Create itinerary-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('itinerary-images', 'itinerary-images', true);

CREATE POLICY "Anyone can view itinerary images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'itinerary-images');

CREATE POLICY "Authenticated users can upload itinerary images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'itinerary-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own itinerary images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'itinerary-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at on route_requests
CREATE TRIGGER update_route_requests_updated_at
  BEFORE UPDATE ON public.route_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
