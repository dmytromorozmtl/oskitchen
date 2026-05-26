# Webhook cron route hardening

## Route

`GET` and `POST` `/api/cron/webhook-jobs`

## Auth

- Requires `Authorization: Bearer ${CRON_SECRET}` matching `process.env.CRON_SECRET`.
- Missing secret → **503** (`Cron not configured`).
- Wrong secret → **401**.

## Behavior

- `WEBHOOK_JOB_BATCH_SIZE` caps work per invocation (see `lib/webhooks/webhook-job-config.ts`).
- Query `?dryRun=1` (or `dry_run=1`) returns JSON metadata **without** processing jobs (still requires valid bearer).
- Response JSON **never** includes webhook bodies.

### Example (staging)

```bash
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  "https://<host>/api/cron/webhook-jobs?dryRun=1"
```

### Example (process batch)

```bash
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  "https://<host>/api/cron/webhook-jobs"
```

## Vercel

`vercel.json` schedules `*/5 * * * *` on this path. Ensure project env has `CRON_SECRET`.

## Failure modes

| Symptom | Cause | Mitigation |
|---------|-------|------------|
| 503 | `CRON_SECRET` unset | Set secret |
| 401 | Bearer mismatch | Rotate / copy exact value |
| Jobs stuck PROCESSING | Worker crash mid-flight | Wait for stale lock (5 min) or manual unlock query (ops) |
