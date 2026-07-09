// One-shot seed function for the public.cities dictionary.
// Reads bundled cities.json and inserts rows in batches using the service role.
// Idempotent via ON CONFLICT (geoname_id) DO NOTHING at the DB level.
import { createClient } from 'npm:@supabase/supabase-js@2'
import cities from './cities.json' with { type: 'json' }

Deno.serve(async () => {
  const url = Deno.env.get('SUPABASE_URL')!
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(url, key)

  const BATCH = 500
  let inserted = 0
  const errors: string[] = []

  for (let i = 0; i < cities.length; i += BATCH) {
    const chunk = cities.slice(i, i + BATCH)
    const { error, count } = await supabase
      .from('cities')
      .upsert(chunk, { onConflict: 'geoname_id', ignoreDuplicates: true, count: 'exact' })
    if (error) {
      errors.push(`batch ${i}: ${error.message}`)
    } else {
      inserted += count ?? chunk.length
    }
  }

  return new Response(
    JSON.stringify({ total: cities.length, inserted, errors }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
