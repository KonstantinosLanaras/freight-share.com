/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  fullName?: string
  companyName?: string
  role?: string
  email?: string
  phone?: string
  challenge?: string
}

const Email = ({
  fullName = '',
  companyName = '',
  role = '',
  email = '',
  phone = '',
  challenge = '',
}: Props) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>New early access request from {fullName || email}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New early access request</Heading>
          <Text style={text}>Someone just requested early access on FreightShare.</Text>
          <Section style={card}>
            <Text style={cardLabel}>Full name</Text>
            <Text style={cardValue}>{fullName || '—'}</Text>
            <Text style={cardLabel}>Company</Text>
            <Text style={cardValue}>{companyName || '—'}</Text>
            <Text style={cardLabel}>Role</Text>
            <Text style={cardValue}>{role || '—'}</Text>
            <Text style={cardLabel}>Email</Text>
            <Text style={cardValue}>{email || '—'}</Text>
            <Text style={cardLabel}>Phone</Text>
            <Text style={cardValue}>{phone || '—'}</Text>
            {challenge && (
              <>
                <Text style={cardLabel}>Biggest freight challenge</Text>
                <Text style={cardValue}>{challenge}</Text>
              </>
            )}
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            You're receiving this because you're listed as the FreightShare contact for early access requests.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Props) =>
    `New early access request — ${d.fullName || d.email || 'FreightShare'}${d.companyName ? ` (${d.companyName})` : ''}`,
  displayName: 'Early access notification',
  to: 'contact@freight-share.com',
  previewData: {
    fullName: 'Jane Doe',
    companyName: 'Acme Freight',
    role: 'carrier',
    email: 'jane@acme.example',
    phone: '+39 348 056 7378',
    challenge: 'Empty backhauls between Milan and Athens.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { color: '#0f172a', fontSize: '22px', fontWeight: 700, margin: '0 0 16px' }
const text = { color: '#0f172a', fontSize: '15px', lineHeight: '22px', margin: '0 0 12px' }
const card = { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', margin: '20px 0' }
const cardLabel = { color: '#64748b', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.04em', margin: '8px 0 2px' }
const cardValue = { color: '#0f172a', fontSize: '15px', fontWeight: 600, margin: '0' }
const hr = { borderColor: '#e2e8f0', margin: '28px 0 16px' }
const footer = { color: '#64748b', fontSize: '12px', lineHeight: '18px' }
