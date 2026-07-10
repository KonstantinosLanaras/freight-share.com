/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Click the button below to accept the invitation and create your
          account.
        </Text>
        <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={btnTable}>
          <tbody>
            <tr>
              <td align="center" bgcolor="#16a34a" style={btnCell}>
                <a href={confirmationUrl} target="_blank" style={btnLink}>Accept Invitation</a>
              </td>
            </tr>
          </tbody>
        </table>
        <Text style={fallbackText}>
          Button not showing? <Link href={confirmationUrl} style={inlineLink}>Click here to accept the invitation</Link>.
        </Text>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#0f172a',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: 'inherit', textDecoration: 'underline' }
const btnTable = { margin: '0 0 25px', borderCollapse: 'separate' as const }
const btnCell = {
  backgroundColor: '#16a34a',
  borderRadius: '10px',
  padding: '14px 28px',
  mso_padding_alt: '14px 28px',
}
const btnLink = {
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  textDecoration: 'none',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
}
const fallbackText = {
  fontSize: '13px',
  color: '#64748b',
  lineHeight: '1.5',
  margin: '20px 0 0',
}
const inlineLink = {
  color: '#15803d',
  textDecoration: 'underline',
  fontWeight: 'bold' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
