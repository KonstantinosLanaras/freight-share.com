/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  recipientName?: string
  fromName?: string
  route?: string
  price?: string | number
  pallets?: string | number
  cargoType?: string
  weightKg?: string | number
  pickupDate?: string
  actionUrl?: string
}

const Email = ({
  recipientName,
  fromName = 'The other party',
  route = '',
  price,
  pallets,
  cargoType,
  weightKg,
  pickupDate,
  actionUrl = 'https://freight-share.com',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your offer was accepted on FreightShare</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Offer accepted</Heading>
        <Text style={text}>
          {recipientName ? `Hi ${recipientName},` : 'Hi there,'}
        </Text>
        <Text style={text}>
          Good news — <strong>{fromName}</strong> accepted your offer. Here
          are the shipment details, and you can coordinate the rest through
          FreightShare.
        </Text>
        {route && (
          <Section style={card}>
            <Text style={cardLabel}>Route</Text>
            <Text style={cardValue}>{route}</Text>
            {price != null && (
              <>
                <Text style={cardLabel}>Agreed price</Text>
                <Text style={cardValue}>€{price}</Text>
              </>
            )}
            {pallets != null && (
              <>
                <Text style={cardLabel}>Pallets</Text>
                <Text style={cardValue}>{pallets}</Text>
              </>
            )}
            {cargoType && (
              <>
                <Text style={cardLabel}>Cargo type</Text>
                <Text style={cardValue}>{cargoType}</Text>
              </>
            )}
            {weightKg != null && (
              <>
                <Text style={cardLabel}>Weight</Text>
                <Text style={cardValue}>{weightKg} kg</Text>
              </>
            )}
            {pickupDate && (
              <>
                <Text style={cardLabel}>Pickup date</Text>
                <Text style={cardValue}>{pickupDate}</Text>
              </>
            )}
          </Section>
        )}
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={actionUrl} style={button}>Open shipment</Button>
        </Section>
        <Text style={text}>
          Your CMR consignment note and invoice are generated from this
          shipment's details and become available to download from the
          shipment page above once pickup/delivery are recorded.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          You're receiving this because you have an active FreightShare account.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Props) => `Your offer was accepted by ${d.fromName || 'the other party'}`,
  displayName: 'Offer accepted',
  previewData: {
    recipientName: 'Alex',
    fromName: 'Alpha Foods GmbH',
    route: 'Amsterdam, NL → Berlin, DE',
    price: 1250,
    pallets: 8,
    cargoType: 'general',
    weightKg: 4200,
    pickupDate: 'Aug 4, 2026',
    actionUrl: 'https://freight-share.com/dashboard/carrier',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { color: 'hsl(222, 47%, 11%)', fontSize: '22px', fontWeight: 700, margin: '0 0 16px' }
const text = { color: 'hsl(222, 47%, 11%)', fontSize: '15px', lineHeight: '22px', margin: '0 0 12px' }
const card = { backgroundColor: 'hsl(210, 20%, 98%)', border: '1px solid hsl(210, 20%, 90%)', borderRadius: '10px', padding: '16px 20px', margin: '20px 0' }
const cardLabel = { color: 'hsl(215, 16%, 47%)', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.04em', margin: '8px 0 2px' }
const cardValue = { color: 'hsl(222, 47%, 11%)', fontSize: '15px', fontWeight: 600, margin: '0' }
const button = { backgroundColor: 'hsl(142, 76%, 36%)', color: '#ffffff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, display: 'inline-block' }
const hr = { borderColor: 'hsl(210, 20%, 90%)', margin: '28px 0 16px' }
const footer = { color: 'hsl(215, 16%, 47%)', fontSize: '12px', lineHeight: '18px' }
