import { afterEach, describe, expect, it } from "vitest";

import {
  isWebhookAsyncQueueEnabled,
  webhookQueueProductionFailure,
} from "@/lib/webhooks/webhook-queue-mode";
import { describeQueuePosture } from "@/services/queue/queue-service";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("webhook queue mode", () => {
  it("keeps inline mode as default in development", () => {
    process.env.NODE_ENV = "development";
    delete process.env.WEBHOOK_ASYNC_QUEUE;

    expect(isWebhookAsyncQueueEnabled()).toBe(false);
    expect(describeQueuePosture()).toEqual({
      ok: true,
      mode: "INLINE_LOW_VOLUME",
      notes:
        "Webhook handlers process inside the HTTP request. Acceptable for pilots; not a high-throughput architecture.",
      productionFailure: null,
    });
  });

  it("allows explicit async queue in development", () => {
    process.env.NODE_ENV = "development";
    process.env.WEBHOOK_ASYNC_QUEUE = "true";

    expect(isWebhookAsyncQueueEnabled()).toBe(true);
    expect(describeQueuePosture().mode).toBe("DATABASE_WEBHOOK_JOBS");
  });

  it("forces async queue in production and reports missing cron secret", () => {
    process.env.NODE_ENV = "production";
    process.env.WEBHOOK_ASYNC_QUEUE = "false";
    delete process.env.CRON_SECRET;

    expect(isWebhookAsyncQueueEnabled()).toBe(true);
    expect(webhookQueueProductionFailure()).toContain("CRON_SECRET");
    expect(describeQueuePosture()).toEqual({
      ok: false,
      mode: "DATABASE_WEBHOOK_JOBS",
      notes:
        "WooCommerce webhooks enqueue `webhook_processing_jobs` and return fast. Cron worker must be scheduled with CRON_SECRET.",
      productionFailure:
        "Webhook async queue is required in production, but CRON_SECRET is missing for the webhook drain worker.",
    });
  });
});
