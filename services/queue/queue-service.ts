import {
  isWebhookAsyncQueueEnabled,
  webhookQueueProductionFailure,
} from "@/lib/webhooks/webhook-queue-mode";

/**
 * OS Kitchen queue posture for launch honesty.
 *
 * - **DB-backed webhook jobs** — always required in production; optional in dev/test via
 *   `WEBHOOK_ASYNC_QUEUE=true`. Cron drains `/api/cron/webhook-jobs`.
 * - **Inline** — local/dev/test-only fallback for low-volume work and debugging.
 */
export function describeQueuePosture(): {
  ok: boolean;
  mode: "DATABASE_WEBHOOK_JOBS" | "INLINE_LOW_VOLUME";
  notes: string;
  productionFailure: string | null;
} {
  const productionFailure = webhookQueueProductionFailure();
  if (isWebhookAsyncQueueEnabled()) {
    return {
      ok: !productionFailure,
      mode: "DATABASE_WEBHOOK_JOBS",
      notes:
        "WooCommerce webhooks enqueue `webhook_processing_jobs` and return fast. Cron worker must be scheduled with CRON_SECRET.",
      productionFailure,
    };
  }
  return {
    ok: true,
    mode: "INLINE_LOW_VOLUME",
    notes:
      "Webhook handlers process inside the HTTP request. Acceptable for pilots; not a high-throughput architecture.",
    productionFailure: null,
  };
}
