// Notifies the FreightShare team (fixed recipient set on the template) about a
// new early access request.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendAndLog } from '../_shared/email-log.ts'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  let body: any
  try { body = await req.json() } catch { return json({ error: 'invalid_json' }, 400) }

  const d = body?.templateData ?? body
  const templateData = {
    fullName: str(d?.fullName, 200),
    companyName: str(d?.companyName, 200),
    role: str(d?.role, 100),
    email: str(d?.email, 255),
    phone: str(d?.phone, 50),
    challenge: str(d?.challenge, 2000),
  }
  if (!templateData.fullName || !templateData.email) return json({ error: 'missing_fields' }, 400)

  try {
    const result = await sendAndLog('early-access-notification', 'contact@freight-share.com', {
      templateData,
      idempotencyKey: str(body?.idempotencyKey, 200) || undefined,
    })
    return json({ success: result.sent })
  } catch {
    return json({ error: 'send_failed' }, 500)
  }
})
