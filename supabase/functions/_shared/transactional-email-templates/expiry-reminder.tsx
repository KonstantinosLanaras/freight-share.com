/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  recipientName?: string
  entityType?: 'load' | 'route'
  daysUntil?: 1 | 7
  route?: string
  pallets?: string | number
  cargoType?: string
  spaceType?: string
  actionUrl?: string
}

const Email = ({
  recipientName,
  entityType = 'load',
  daysUntil = 7,
  route = '',
  pallets,
  cargoType,
  spaceType,
  actionUrl = 'https://freight-share.com',
}: Props) => {
  const label = entityType === 'route' ? 'route' : 'load'
  const urgency = daysUntil === 1 ? 'tomorrow' : 'in 7 days'
  const urgencyColor = daysUntil === 1 ? 'hsl(0, 84%, 55%)' : 'hsl(38, 92%, 50%)'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your {label} on FreightShare expires {urgency} — update it to stay visible</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your {label} expires {urgency}</Heading>
          <Text style={text}>
            {recipientName ? `Hi ${recipientName},` : 'Hi there,'}
          </Text>
          <Text style={text}>
            Your listing on FreightShare is expiring <strong style={{ color: urgencyColor }}>{urgency}</strong>.
            If it hasn't been filled yet, updating the dates or details will keep it
            visible to {entityType === 'route' ? 'shippers' : 'carriers'} browsing the marketplace.
          </Text>
          {route && (
            <Section style={card}>
              <Text style={cardLabel}>Route</Text>
              <Text style={cardValue}>{route}</Text>
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
              {spaceType && (
                <>
                  <Text style={cardLabel}>Space type</Text>
                  <Text style={cardValue}>{spaceType}</Text>
                </>
              )}
            </Section>
          )}
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={actionUrl} style={button}>
              {daysUntil === 1 ? 'Update now' : 'Review listing'}
            </Button>
          </Section>
          <Text style={hint}>
            If your {label} has already been arranged outside the platform, you can ignore this reminder.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            You're receiving this because you have an active FreightShare account.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Props) => {
    const label = d.entityType === 'route' ? 'route' : 'load'
    const urgency = d.daysUntil === 1 ? 'tomorrow' : 'in 7 days'
    return `Your ${label} expires ${urgency} — update to stay visible`
  },
  displayName: 'Expiry reminder',
  previewData: {
    recipientName: 'Marco',
    entityType: 'load',
    daysUntil: 7,
    route: 'Milan, IT → Brussels, BE',
    pallets: 6,
    cargoType: 'General goods',
    actionUrl: 'https://freight-share.com/dashboard/shipper/loads',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { color: 'hsl(222, 47%, 11%)', fontSize: '22px', fontWeight: 700, margin: '0 0 16px' }
const text = { color: 'hsl(222, 47%, 11%)', fontSize: '15px', lineHeight: '22px', margin: '0 0 12px' }
const hint = { color: 'hsl(215, 16%, 47%)', fontSize: '13px', lineHeight: '20px', margin: '0 0 12px' }
const card = { backgroundColor: 'hsl(210, 20%, 98%)', border: '1px solid hsl(210, 20%, 90%)', borderRadius: '10px', padding: '16px 20px', margin: '20px 0' }
const cardLabel = { color: 'hsl(215, 16%, 47%)', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.04em', margin: '8px 0 2px' }
const cardValue = { color: 'hsl(222, 47%, 11%)', fontSize: '15px', fontWeight: 600, margin: '0' }
const button = { backgroundColor: 'hsl(222, 47%, 11%)', color: '#ffffff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, display: 'inline-block' }
const hr = { borderColor: 'hsl(210, 20%, 90%)', margin: '28px 0 16px' }
const footer = { color: 'hsl(215, 16%, 47%)', fontSize: '12px', lineHeight: '18px' }
