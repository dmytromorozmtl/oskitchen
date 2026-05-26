# Staging webhook async verification runbook

**Scope:** Validate `WEBHOOK_ASYNC_QUEUE=true` end-to-end on a **real staging deployment** with **real WooCommerce + Shopify test traffic**. Local dev cannot substitute for partner delivery unless you mirror signing and headers exactly.

## 1. Database

```bash
npx prisma migrate status
npm run db:deploy
npx prisma generate
npm run verify:staging-webhook-async
```

The verify script fails fast if `webhook_processing_jobs` or `error_recovery_items` is missing from the connected database.

**Manual SQL (optional)**

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('webhook_processing_jobs', 'error_recovery_items');
```

**Verify table**

- Table `webhook_processing_jobs` exists.
- Table `error_recovery_items` exists (FAILED webhook jobs → error recovery).
- Indexes from migrations present (see `prisma/migrations/`).

## 2. Environment

Set on staging:

- `WEBHOOK_ASYNC_QUEUE=true`
- `CRON_SECRET` — long random string; never log it.
- Optional: `WEBHOOK_JOB_BATCH_SIZE`, `WEBHOOK_JOB_MAX_ATTEMPTS` if supported in `webhook-job-config` / cron route.

## 3. Cron

- **Route:** `POST /api/cron/webhook-jobs`
- **Header:** `Authorization: Bearer <CRON_SECRET>`
- **Schedule:** at least every 1–5 minutes during validation; production may tune from volume.
- **Unauthorized call:** expect **401** with no secret leakage in body.

## 4. WooCommerce real delivery

1. Create/update a test order in **WooCommerce staging**.
2. Confirm `WebhookEvent` row created (platform or SQL).
3. Confirm `WebhookProcessingJob` row in `QUEUED`/`RETRYING`/`PROCESSING` as expected.
4. Run cron with bearer secret.
5. Expect terminal **`PROCESSED`** for supported topics, or honest processor error (not fake success).
6. Confirm downstream order/import/mapping as applicable.
7. Integration health surfaces should reflect errors if any.

## 5. Shopify real delivery

1. Register test webhooks on a **Shopify dev store** pointing at staging URLs.
2. Trigger a real delivery or Shopify test event.
3. Validate job lifecycle same as Woo.
4. Unsupported topics must surface as **IGNORED/UNSUPPORTED** (per processor), never silent success.

## 6. Failure drill

1. Force malformed payload or break processor temporarily.
2. Expect `RETRYING`, increasing `attemptCount`, future `nextAttemptAt`.
3. After max attempts → **`FAILED`**.
4. Confirm FAILED visible under **Sales channels → Webhooks** and **Error recovery** feed (open recovery row).

## 7. Security checks

- Logs must not print raw bodies, auth headers, or signing secrets.
- Replay requires permission + audit trail; reason field follows `AUDIT_REASON_RETENTION_MODE`.

## 8. Acceptance criteria

| Criterion | Pass |
|-----------|------|
| Valid Woo job | `PROCESSED` (or documented supported outcome) |
| Valid Shopify supported job | `PROCESSED` or explicit supported path |
| Invalid / poison | `RETRYING` → `FAILED` |
| Failed jobs visible | Dashboard + platform error lists + recovery |
| Cron auth | 401 without secret; 200 with JSON summary only |
| No secrets in responses | Manual spot-check |
