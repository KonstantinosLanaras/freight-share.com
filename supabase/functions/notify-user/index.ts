// Resolves a recipient user's email from auth.users and sends one of the
// offer notification templates. Client code never touches auth.users directly.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { sendAndLog } from '../_shared/email-log.ts'

const ALLOWED_TEMPLATES = new Set(['offer-received', 'offer-accepted'])

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) return json({ error: 'server_config' }, 500)

  let body: any
  try { body = await req.json() } catch { return json({ error: 'invalid_json' }, 400) }

  const { recipientUserId, templateName, templateData, idempotencyKey } = body || {}
  if (!recipientUserId || !templateName) return json({ error: 'missing_fields' }, 400)
  if (!ALLOWED_TEMPLATES.has(templateName)) return json({ error: 'unknown_template' }, 400)

  const admin = createClient(supabaseUrl, serviceKey)
  const { data: userResp, error: userErr } = await admin.auth.admin.getUserById(recipientUserId)
  if (userErr || !userResp?.user?.email) {
    console.error('Cannot resolve recipient', { recipientUserId })
    return json({ error: 'recipient_not_found' }, 404)
  }

  let recipientName: string | undefined
  try {
    const { data: prof } = await admin
      .from('public_profiles')
      .select('full_name, company_name')
      .eq('id', recipientUserId)
      .maybeSingle()
    recipientName = (prof as any)?.full_name || (prof as any)?.company_name || undefined
  } catch { /* optional */ }

  try {
    const result = await sendAndLog(templateName, userResp.user.email, {
      idempotencyKey,
      templateData: { ...(templateData || {}), recipientName: recipientName ?? templateData?.recipientName },
    })
    return json(result.sent ? { success: true } : { success: false, reason: 'email_suppressed' })
  } catch (err) {
    console.error('Send failed', { templateName })
    return json({ error: 'send_failed' }, 500)
  }
})
