// Resolves a recipient user's email from auth.users, then invokes
// send-transactional-email. Called from frontend with just recipientUserId
// so client code never touches auth.users directly.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'server_config' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: any
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { recipientUserId, templateName, templateData, idempotencyKey } = body || {}
  if (!recipientUserId || !templateName) {
    return new Response(JSON.stringify({ error: 'missing_fields' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const admin = createClient(supabaseUrl, serviceKey)

  const { data: userResp, error: userErr } = await admin.auth.admin.getUserById(recipientUserId)
  if (userErr || !userResp?.user?.email) {
    console.error('Cannot resolve recipient', { recipientUserId, err: userErr })
    return new Response(JSON.stringify({ error: 'recipient_not_found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const recipientEmail = userResp.user.email

  // Enrich with recipient name from public_profiles if available
  let recipientName: string | undefined
  try {
    const { data: prof } = await admin
      .from('public_profiles')
      .select('full_name, company_name')
      .eq('id', recipientUserId)
      .maybeSingle()
    recipientName = (prof as any)?.full_name || (prof as any)?.company_name || undefined
  } catch { /* optional */ }

  const invokeResp = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      templateName,
      recipientEmail,
      idempotencyKey,
      templateData: { ...(templateData || {}), recipientName: recipientName ?? (templateData?.recipientName) },
    }),
  })

  const respText = await invokeResp.text()
  return new Response(respText, {
    status: invokeResp.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
