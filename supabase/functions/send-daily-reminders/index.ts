// Daily reminder job — called by pg_cron at 08:00 UTC.
//
// Sends expiry warnings for unfulfilled loads/routes (7-day and 1-day ahead),
// pickup reminders to both parties for paid shipments with tomorrow's pickup,
// and a delivery follow-up to shippers once the pickup window has closed.
//
// Idempotency: each send uses a deterministic key so Lovable's API dedupes
// retries automatically.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendAndLog } from '../_shared/email-log.ts'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const addDays = (base: string, n: number): string => {
  const d = new Date(base + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().split('T')[0]
}

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) return json({ error: 'server_config' }, 500)

  const admin = createClient(supabaseUrl, serviceKey)

  const today = new Date().toISOString().split('T')[0]
  const d1 = addDays(today, 1)   // tomorrow
  const d7 = addDays(today, 7)   // one week ahead
  const d_1 = addDays(today, -1) // yesterday (for delivery follow-up)

  const results: Record<string, number> = {
    load_7d: 0, load_1d: 0,
    route_7d: 0, route_1d: 0,
    pickup: 0,
    delivery_followup: 0,
    errors: 0,
  }

  // Helper: resolve email + name for a user ID
  const resolveUser = async (userId: string) => {
    const { data } = await admin.auth.admin.getUserById(userId)
    if (!data?.user?.email) return null
    let recipientName: string | undefined
    const { data: prof } = await admin
      .from('public_profiles')
      .select('full_name, company_name')
      .eq('id', userId)
      .maybeSingle()
    recipientName = (prof as any)?.company_name || (prof as any)?.full_name || undefined
    return { email: data.user.email, name: recipientName }
  }

  // ── 1. LOAD EXPIRY REMINDERS ──────────────────────────────────────────────
  try {
    const { data: loads } = await admin
      .from('loads')
      .select('id, shipper_id, origin_city, destination_city, pickup_date_to, pallets, cargo_type')
      .eq('status', 'posted')
      .in('pickup_date_to', [d1, d7])

    for (const load of loads || []) {
      const daysUntil = load.pickup_date_to === d1 ? 1 : 7
      const u = await resolveUser(load.shipper_id)
      if (!u) continue
      try {
        await sendAndLog('expiry-reminder', u.email, {
          idempotencyKey: `expiry-load-${load.id}-${daysUntil}d`,
          templateData: {
            recipientName: u.name,
            entityType: 'load',
            daysUntil,
            route: `${load.origin_city} → ${load.destination_city}`,
            pallets: load.pallets,
            cargoType: load.cargo_type,
            actionUrl: `${supabaseUrl.replace('.supabase.co', '')}-app.lovable.app/dashboard/shipper/loads`,
          },
        })
        results[`load_${daysUntil}d`]++
      } catch (e) {
        console.error('load expiry send failed', { loadId: load.id, daysUntil, error: String(e) })
        results.errors++
      }
    }
  } catch (e) {
    console.error('load expiry query failed', String(e))
    results.errors++
  }

  // ── 2. ROUTE EXPIRY REMINDERS ─────────────────────────────────────────────
  try {
    const { data: routes } = await admin
      .from('routes')
      .select('id, carrier_id, origin_city, destination_city, departure_date_to, available_pallets, space_type')
      .eq('is_active', true)
      .in('status', ['planned', 'active'])
      .in('departure_date_to', [d1, d7])

    for (const route of routes || []) {
      const daysUntil = route.departure_date_to === d1 ? 1 : 7
      const u = await resolveUser(route.carrier_id)
      if (!u) continue
      try {
        await sendAndLog('expiry-reminder', u.email, {
          idempotencyKey: `expiry-route-${route.id}-${daysUntil}d`,
          templateData: {
            recipientName: u.name,
            entityType: 'route',
            daysUntil,
            route: `${route.origin_city} → ${route.destination_city}`,
            pallets: route.available_pallets,
            spaceType: route.space_type,
            actionUrl: `https://freight-share.com/dashboard/carrier/routes`,
          },
        })
        results[`route_${daysUntil}d`]++
      } catch (e) {
        console.error('route expiry send failed', { routeId: route.id, daysUntil, error: String(e) })
        results.errors++
      }
    }
  } catch (e) {
    console.error('route expiry query failed', String(e))
    results.errors++
  }

  // ── 3. PICKUP REMINDERS (paid shipments, pickup tomorrow) ─────────────────
  try {
    const { data: pickupLoads } = await admin
      .from('loads')
      .select('id, origin_city, destination_city, pickup_date_from, pallets, cargo_type')
      .eq('pickup_date_from', d1)

    if ((pickupLoads || []).length > 0) {
      const loadIds = (pickupLoads || []).map((l: any) => l.id)
      const loadMap = new Map((pickupLoads || []).map((l: any) => [l.id, l]))

      const { data: shipments } = await admin
        .from('shipments')
        .select('id, shipper_id, carrier_id, final_price, load_id')
        .in('payment_status', ['paid', 'completed'])
        .in('load_id', loadIds)

      for (const shipment of shipments || []) {
        const load = loadMap.get(shipment.load_id)
        if (!load) continue
        const routeLabel = `${load.origin_city} → ${load.destination_city}`
        const pickupDateLabel = new Date(d1 + 'T00:00:00Z').toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        })

        for (const { userId, role } of [
          { userId: shipment.shipper_id, role: 'shipper' as const },
          { userId: shipment.carrier_id, role: 'carrier' as const },
        ]) {
          const u = await resolveUser(userId)
          if (!u) continue
          try {
            await sendAndLog('pickup-reminder', u.email, {
              idempotencyKey: `pickup-${shipment.id}-${role}`,
              templateData: {
                recipientName: u.name,
                role,
                route: routeLabel,
                price: shipment.final_price,
                pallets: load.pallets,
                cargoType: load.cargo_type,
                pickupDate: pickupDateLabel,
                actionUrl: `https://freight-share.com/dashboard/${role}/shipments`,
              },
            })
            results.pickup++
          } catch (e) {
            console.error('pickup reminder send failed', { shipmentId: shipment.id, role, error: String(e) })
            results.errors++
          }
        }
      }
    }
  } catch (e) {
    console.error('pickup reminder query failed', String(e))
    results.errors++
  }

  // ── 4. DELIVERY FOLLOW-UP (pickup window closed yesterday, not yet completed)
  try {
    const { data: pastLoads } = await admin
      .from('loads')
      .select('id, origin_city, destination_city, pickup_date_to, pallets')
      .eq('pickup_date_to', d_1)

    if ((pastLoads || []).length > 0) {
      const loadIds = (pastLoads || []).map((l: any) => l.id)
      const loadMap = new Map((pastLoads || []).map((l: any) => [l.id, l]))

      const { data: shipments } = await admin
        .from('shipments')
        .select('id, shipper_id, final_price, load_id')
        .in('payment_status', ['paid'])       // 'completed' means already confirmed
        .not('status', 'eq', 'completed')
        .not('status', 'eq', 'delivered')
        .in('load_id', loadIds)

      for (const shipment of shipments || []) {
        const load = loadMap.get(shipment.load_id)
        if (!load) continue
        const u = await resolveUser(shipment.shipper_id)
        if (!u) continue
        try {
          await sendAndLog('delivery-followup', u.email, {
            idempotencyKey: `delivery-followup-${shipment.id}`,
            templateData: {
              recipientName: u.name,
              route: `${load.origin_city} → ${load.destination_city}`,
              price: shipment.final_price,
              pallets: load.pallets,
              actionUrl: `https://freight-share.com/dashboard/shipper/shipments`,
            },
          })
          results.delivery_followup++
        } catch (e) {
          console.error('delivery followup send failed', { shipmentId: shipment.id, error: String(e) })
          results.errors++
        }
      }
    }
  } catch (e) {
    console.error('delivery followup query failed', String(e))
    results.errors++
  }

  console.log('[send-daily-reminders] done', results)
  return json({ ok: true, results })
})
