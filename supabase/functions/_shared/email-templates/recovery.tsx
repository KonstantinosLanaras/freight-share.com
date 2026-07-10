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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password for {siteName}. Click
          the button below to choose a new password.
        </Text>
        <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={btnTable}>
          <tbody>
            <tr>
              <td align="center" style={btnCell}>
                <a href={confirmationUrl} style={btnLink}>Reset Password</a>
              </td>
            </tr>
          </tbody>
        </table>
        <Text style={fallbackText}>
          Button not showing? <Link href={confirmationUrl} style={inlineLink}>Click here to reset your password</Link>.
        </Text>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this
          email. Your password will not be changed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
const btnTable = { margin: '0 0 25px', borderCollapse: 'separate' as const }
const btnCell = {
  backgroundColor: '#16a34a',
  borderRadius: '10px',
  border: '1px solid #15803d',
}
const btnLink = {
  display: 'inline-block',
  padding: '14px 28px',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  backgroundColor: '#16a34a',
  borderRadius: '10px',
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
