-- KitchenOS — SQL for DB-backed alerts on webhook_processing_jobs
-- (see docs/OBSERVABILITY_WEBHOOK_CRON_RUNBOOK_RU.md §3–§4, §8).
-- Wire in Datadog / Grafana / pg_cron + Slack as your stack allows.

-- Alert 1 — queue depth (tune threshold in monitor; example uses 500)
-- Fire when too many jobs wait for the cron worker.
SELECT COUNT(*)::bigint AS queued_and_retrying
FROM webhook_processing_jobs
WHERE status::text IN ('QUEUED', 'RETRYING');
-- Suggested condition: queued_and_retrying > 500 (adjust to baseline).

-- Alert 2 — stuck PROCESSING (tune interval; default 30 minutes in runbook)
SELECT id, status::text, created_at, updated_at,
       EXTRACT(EPOCH FROM (NOW() - updated_at)) / 60 AS idle_minutes
FROM webhook_processing_jobs
WHERE status::text = 'PROCESSING'
  AND updated_at < NOW() - INTERVAL '30 minutes'
ORDER BY updated_at ASC;
-- Suggested condition: EXISTS / row count > 0.

-- Alert 2b — same condition, single scalar (удобно для Grafana «Threshold» / одна time-series)
SELECT COUNT(*)::bigint AS stuck_processing_count
FROM webhook_processing_jobs
WHERE status::text = 'PROCESSING'
  AND updated_at < NOW() - INTERVAL '30 minutes';
-- Suggested condition: stuck_processing_count > 0.
