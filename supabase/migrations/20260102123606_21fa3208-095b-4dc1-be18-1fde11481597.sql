-- Add dispute tracking fields to shipments table
ALTER TABLE public.shipments 
ADD COLUMN IF NOT EXISTS dispute_status text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dispute_reason text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dispute_raised_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dispute_resolved_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS delivery_marked_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS platform_fee_amount numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS carrier_payout_amount numeric DEFAULT NULL;

-- Add index for dispute queries
CREATE INDEX IF NOT EXISTS idx_shipments_dispute_status ON public.shipments(dispute_status) WHERE dispute_status IS NOT NULL;

-- Add index for auto-confirmation check (48-hour window)
CREATE INDEX IF NOT EXISTS idx_shipments_delivery_marked_at ON public.shipments(delivery_marked_at) WHERE delivery_marked_at IS NOT NULL AND status = 'delivered';