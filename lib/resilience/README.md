# Resilience

- **`lib/retry/with-retry.ts`** — exponential backoff for outbound integrations.
- **`lib/errors`** — map failures to stable `AppError` codes for UI + logs.
- **Queues / DLQ** — not implemented here; use Vercel Cron + DB outbox or a worker when webhook volume requires it.
