import { createClient } from 'npm:@supabase/supabase-js@2'
import { EmailAPIError } from 'npm:@lovable.dev/email-js@0.3.1'
import { sendTemplateEmail } from './transactional-email-templates/send-email.ts'

// Sends a registered template and records the outcome in email_send_log.
export async function sendAndLog(
  templateName: string,
  to: string,
  opts: { templateData?: Record<string, any>; idempotencyKey?: string },
) {
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const log = async (status: string, error_message?: string) => {
    const { error } = await admin.from('email_send_log').insert({
      template_name: templateName,
      recipient_email: to,
      status,
      error_message: error_message ?? null,
    })
    if (error) console.error('email_send_log insert failed', { code: error.code, message: error.message })
  }
  try {
    const result = await sendTemplateEmail(templateName, to, opts)
    await log(result.sent ? 'sent' : 'suppressed')
    return result
  } catch (err) {
    const msg = err instanceof EmailAPIError || err instanceof Error ? err.message : String(err)
    await log('failed', msg)
    throw err
  }
}
