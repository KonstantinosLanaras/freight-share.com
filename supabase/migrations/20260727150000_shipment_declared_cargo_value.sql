-- Persists the cargo value the shipper declares in GoodsConfirmationDialog
-- at checkout. Previously this only existed in client-side React state
-- long enough to compute the illustrative coverage-gap/premium display,
-- then was discarded -- meaning the platform had no durable record of
-- declared value for a shipment (relevant to invoices, disputes, and the
-- CMR/contract-of-carriage document generated from shipment records).

ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS declared_cargo_value_eur numeric;
