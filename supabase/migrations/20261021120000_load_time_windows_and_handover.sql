-- Add time window and flexibility fields to loads
ALTER TABLE public.loads
  ADD COLUMN IF NOT EXISTS pickup_time_from  time,
  ADD COLUMN IF NOT EXISTS pickup_time_to    time,
  ADD COLUMN IF NOT EXISTS pickup_flexibility text DEFAULT 'flexible',
  ADD COLUMN IF NOT EXISTS delivery_time_from time,
  ADD COLUMN IF NOT EXISTS delivery_time_to   time,
  ADD COLUMN IF NOT EXISTS delivery_flexibility text DEFAULT 'flexible';

-- Add agreed handover datetimes to shipments so the two parties can
-- lock in an exact pickup/delivery time after the booking is confirmed.
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS agreed_pickup_datetime   timestamptz,
  ADD COLUMN IF NOT EXISTS agreed_delivery_datetime timestamptz,
  ADD COLUMN IF NOT EXISTS handover_proposed_by     uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS handover_status          text DEFAULT 'open';
