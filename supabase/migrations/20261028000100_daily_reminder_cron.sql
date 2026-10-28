-- Daily reminder cron job
--
-- Calls the `send-daily-reminders` edge function every day at 08:00 UTC.
-- Requires pg_cron and pg_net extensions (both available on Supabase Pro/Team).
--
-- BEFORE RUNNING: add these two secrets to Supabase Vault so the cron job
-- can authenticate against the edge function:
--
--   insert into vault.secrets (name, secret) values
--     ('supabase_project_url', 'https://<YOUR_PROJECT_REF>.supabase.co'),
--     ('supabase_service_role_key', '<YOUR_SERVICE_ROLE_KEY>')
--   on conflict (name) do update set secret = excluded.secret;
--
-- You can also find the project URL and service role key in:
--   Supabase Dashboard → Project Settings → API
-- ---------------------------------------------------------------------------

-- Enable required extensions (idempotent)
create extension if not exists pg_cron  with schema extensions;
create extension if not exists pg_net   with schema extensions;

-- Remove any previous schedule with this name before re-creating
select cron.unschedule('send-daily-reminders') where exists (
  select 1 from cron.job where jobname = 'send-daily-reminders'
);

-- Schedule: 08:00 UTC every day
select cron.schedule(
  'send-daily-reminders',
  '0 8 * * *',
  $cron$
  select
    net.http_post(
      url := (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'supabase_project_url'
        limit 1
      ) || '/functions/v1/send-daily-reminders',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'supabase_service_role_key'
          limit 1
        )
      ),
      body := '{}'::jsonb
    ) as request_id;
  $cron$
);
