# Webhook processing jobs — migration runbook

## Preconditions

- Backup production DB (snapshot) before first deploy of this table.
- Ensure Prisma CLI can reach the database: for Supabase, prefer **Session pooler** for `DIRECT_URL` when the direct host is IPv6-only from CI.
- `DATABASE_URL` = runtime pooler; `DIRECT_URL` = migrations (per Supabase docs).

## Commands (local / CI / staging)

```bash
npx prisma migrate status
npm run db:deploy
npx prisma generate
npm run typecheck
```

**Expected:** `migrate status` shows `20260615180000_webhook_processing_jobs` as applied; `typecheck` passes.

## Verify schema

```sql
\d webhook_processing_jobs
SELECT indexname FROM pg_indexes WHERE tablename = 'webhook_processing_jobs';
```

Expect indexes on `(status, next_attempt_at)` and `(user_id, created_at)` plus unique on `webhook_event_id`.

## Staging apply

1. Merge migration branch.
2. Run `npm run db:deploy` against staging `DATABASE_URL`/`DIRECT_URL`.
3. `WEBHOOK_ASYNC_QUEUE=true`, set `CRON_SECRET`, confirm Vercel cron hits `/api/cron/webhook-jobs`.

## Production apply

- Same as staging; schedule maintenance window if large table locks are a concern (usually fast DDL).

## Rollback

- Dropping enum/table **loses async job state** — prefer feature-flag off (`WEBHOOK_ASYNC_QUEUE=false`) before destructive rollback.

## Common Supabase issue

- **Symptom:** `P1001` / connection timeout from Prisma migrate on laptop IPv4-only network.  
- **Fix:** set `DIRECT_URL` to Supabase **Session mode** pooler connection string.
