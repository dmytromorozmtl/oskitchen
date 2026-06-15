/**
 * Production always uses the async queue posture. Dev/test may opt in via
 * `WEBHOOK_ASYNC_QUEUE=true` while retaining inline fallback for local work.
 */
export function isWebhookAsyncQueueEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return true;
  const v = process.env.WEBHOOK_ASYNC_QUEUE?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function webhookQueueProductionFailure(): string | null {
  if (process.env.NODE_ENV !== "production") return null;
  if (!process.env.CRON_SECRET?.trim()) {
    return "Webhook async queue is required in production, but CRON_SECRET is missing for the webhook drain worker.";
  }
  return null;
}
