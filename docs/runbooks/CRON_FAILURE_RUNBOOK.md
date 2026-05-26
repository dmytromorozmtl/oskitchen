# Cron failure runbook

## Symptoms

- Webhook jobs not draining; `webhook_processing_jobs` stuck in `QUEUED`.
- Vercel cron logs show 401/503 on `/api/cron/webhook-jobs`.

## Checks

1. `CRON_SECRET` present in project env.
2. `Authorization: Bearer` matches exactly (no quotes/newlines).
3. `WEBHOOK_ASYNC_QUEUE=true` if expecting async behavior.

## Safe actions

- Rotate `CRON_SECRET` in env + redeploy.
- Manual `curl` with bearer to validate.

## Customer comms

> Background job processing is catching up; no data loss for successfully received webhooks.
