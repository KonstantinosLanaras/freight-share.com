/// <reference types="npm:@types/react@18.3.1" />
import type * as React from 'npm:react@18.3.1'
import { template as offerReceived } from './offer-received.tsx'
import { template as offerAccepted } from './offer-accepted.tsx'
import { template as earlyAccessNotification } from './early-access-notification.tsx'
import { template as expiryReminder } from './expiry-reminder.tsx'
import { template as pickupReminder } from './pickup-reminder.tsx'
import { template as deliveryFollowup } from './delivery-followup.tsx'
import { template as paymentConfirmed } from './payment-confirmed.tsx'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'offer-received': offerReceived,
  'offer-accepted': offerAccepted,
  'early-access-notification': earlyAccessNotification,
  'expiry-reminder': expiryReminder,
  'pickup-reminder': pickupReminder,
  'delivery-followup': deliveryFollowup,
  'payment-confirmed': paymentConfirmed,
}
