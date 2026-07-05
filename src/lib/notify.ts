import { supabase } from '@/integrations/supabase/client';

type OfferKind = 'offer' | 'bid' | 'request';

interface OfferContext {
  recipientUserId: string;
  fromName: string;
  route?: string;
  price?: string | number;
  pallets?: string | number;
  actionUrl?: string;
  kind?: OfferKind;
  idempotencyKey?: string;
}

async function invokeNotify(templateName: string, ctx: OfferContext) {
  try {
    await supabase.functions.invoke('notify-user', {
      body: {
        recipientUserId: ctx.recipientUserId,
        templateName,
        idempotencyKey: ctx.idempotencyKey,
        templateData: {
          fromName: ctx.fromName,
          route: ctx.route,
          price: ctx.price,
          pallets: ctx.pallets,
          actionUrl: ctx.actionUrl,
          kind: ctx.kind,
        },
      },
    });
  } catch (err) {
    // Fire-and-forget: never block the UI on notifications.
    console.warn('notify failed', err);
  }
}

export const notifyOfferReceived = (ctx: OfferContext) =>
  invokeNotify('offer-received', ctx);

export const notifyOfferAccepted = (ctx: OfferContext) =>
  invokeNotify('offer-accepted', ctx);
