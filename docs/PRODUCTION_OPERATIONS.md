# Production operations

## Health checks

- **HTTP:** `GET /api/health`  
  - Returns JSON `{ status, checks: { database, coreEnv } }`.  
  - `503` when degraded (DB ping fails or core env keys missing).  
  - Safe for load balancers — **no secrets** in body.

- **Database:** `checkDatabaseHealth()` in `lib/db/health.ts` runs `SELECT 1` and measures latency.

## Environment validation

- `npm run check-env` — verifies `.env` / `.env.local` and runs `prisma validate`.  
- `lib/env.ts` — `isEnvConfigured()` for core keys; production throws on invalid config.

## Logging & request correlation (recommended next steps)

1. Add middleware to stamp `x-request-id` (UUID) on responses.  
2. Forward ID into `logger` context (see `lib/logger`).  
3. For Vercel, rely on platform logs + structured JSON lines.

## Cron / queues (current + placeholders)

- Existing cron routes under `app/api/cron/*` (e.g. reminders).  
- **Queue placeholder:** use DB tables (`automation_executions`, webhook retry tables) as interim queues until Redis/SQS.  
- **Worker placeholder:** split heavy handlers into idempotent chunks invoked by cron every minute with lease column.

## Backups

- Supabase: enable PITR / daily backups per project tier — document owner runbook in internal wiki (not duplicated here to avoid stale vendor steps).  
- Application: export critical business tables via existing export APIs on a schedule.

## Deployment checklist (short)

1. `npm run check-env`  
2. `npm run db:deploy`  
3. `npm run build`  
4. Verify `/api/health` on canary  
5. Smoke test: login → dashboard home → production → packing  

## Related

- `docs/LOCAL_DATABASE_SETUP.md`  
- `docs/ENVIRONMENT_FIX_REPORT.md`  
