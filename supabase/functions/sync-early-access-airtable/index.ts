// Syncs an early access request to Airtable (CRM view).
// Non-critical: failures are logged but never break the user submission flow.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/airtable';
const BASE_ID = 'appG2iLyBCXICk8zI';
const TABLE_ID = 'tblhnWPCSCYr2iT4G'; // "Ealry access from website"

interface Payload {
  fullName: string;
  companyName: string;
  role: 'carrier' | 'shipper';
  email: string;
  phone: string;
  challenge?: string;
  source?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
    if (!LOVABLE_API_KEY || !AIRTABLE_API_KEY) {
      throw new Error('Airtable connector not configured');
    }

    const body = (await req.json()) as Payload;
    if (!body?.email || !body?.fullName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const roleName = body.role === 'carrier' ? 'Carrier' : 'Shipper';

    const airtablePayload = {
      records: [
        {
          fields: {
            'Company name': body.companyName,
            'Full Name': body.fullName,
            'Role': roleName,
            'Email': body.email,
            'Phone': body.phone,
            'Challenge': body.challenge || '',
            'Submitted At': new Date().toISOString().slice(0, 10),
            'Source': body.source || 'freight-share.com',
          },
        },
      ],
      typecast: true,
    };

    const resp = await fetch(`${GATEWAY_URL}/v0/${BASE_ID}/${TABLE_ID}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': AIRTABLE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtablePayload),
    });

    if (!resp.ok) {
      const details = await resp.text();
      console.error(`Airtable sync failed [${resp.status}]: ${details}`);
      return new Response(
        JSON.stringify({ error: 'Airtable request failed', status: resp.status, details }),
        { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await resp.json();
    return new Response(JSON.stringify({ ok: true, id: data?.records?.[0]?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('sync-early-access-airtable error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
