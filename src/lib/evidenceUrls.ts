import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'shipment-evidence';
const SIGNED_URL_TTL_SECONDS = 60 * 15; // 15 minutes -- long enough to view a page, short enough not to linger

/**
 * shipment_evidence.photo_url/signature_url store a bare storage path as
 * of migration 20260728120000_shipment_evidence_private_bucket.sql (the
 * bucket used to be public, so earlier rows may still hold a full public
 * URL) -- normalizes either into the path the storage API expects.
 */
function toStoragePath(value: string): string {
  const marker = `/${BUCKET}/`;
  const idx = value.indexOf(marker);
  return idx === -1 ? value : value.slice(idx + marker.length);
}

/** Resolves a stored evidence value into a short-lived signed URL for display. */
export async function resolveEvidenceUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  const path = toStoragePath(value);
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return null;
  return data.signedUrl;
}
