import { supabase } from '@/integrations/supabase/client';
import type { InsuranceDecision } from '@/components/payment/GoodsConfirmationDialog';

export type ShipmentSource =
  | { kind: 'load'; loadId: string; offerId: string }
  | { kind: 'route_request'; routeRequestId: string }
  | { kind: 'deviation_request'; deviationRequestId: string };

export interface CreateShipmentParams {
  source: ShipmentSource;
  shipperId: string;
  carrierId: string;
  finalPrice: number;
  insuranceDecision?: InsuranceDecision;
  shouldSimulatePayment: boolean;
}

/**
 * Single place a shipment row gets created, regardless of what it's
 * sourced from -- a load+offer, a direct route request, or a mid-route
 * deviation request. Exactly one of load_id/route_request_id/
 * deviation_request_id is set (see migration
 * 20260728100000_shipments_generalize_source.sql's check constraint).
 */
export async function createShipmentRecord(params: CreateShipmentParams): Promise<string> {
  const { source, shipperId, carrierId, finalPrice, insuranceDecision, shouldSimulatePayment } = params;

  const payload: Record<string, unknown> = {
    shipper_id: shipperId,
    carrier_id: carrierId,
    final_price: finalPrice,
    status: shouldSimulatePayment ? 'paid' : 'accepted',
    payment_status: shouldSimulatePayment ? 'paid' : 'pending',
    terms_version: '1.0',
    // Not yet in generated Supabase types -- added via migration
    // 20260727150000_shipment_declared_cargo_value.sql.
    declared_cargo_value_eur: insuranceDecision?.declaredCargoValue ?? null,
  };

  if (source.kind === 'load') {
    payload.load_id = source.loadId;
    payload.offer_id = source.offerId;
  } else if (source.kind === 'route_request') {
    payload.route_request_id = source.routeRequestId;
  } else {
    payload.deviation_request_id = source.deviationRequestId;
  }

  const { data, error } = await supabase
    .from('shipments')
    // route_request_id/deviation_request_id aren't in generated Supabase
    // types yet -- added via the same migration as above.
    .insert(payload as any)
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

/**
 * Triggers real Stripe checkout for a created shipment. Mirrors
 * LoadDetails.tsx's production payment step; callers doing the demo-mode
 * simulate branch don't need this at all.
 */
export async function triggerShipmentPayment(params: {
  shipmentId: string;
  amount: number;
  description: string;
  carrierId: string;
  loadId?: string;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-shipment-payment', {
    body: {
      shipmentId: params.shipmentId,
      amount: params.amount,
      description: params.description,
      loadId: params.loadId,
      carrierId: params.carrierId,
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('No payment URL returned');
  return data.url as string;
}
