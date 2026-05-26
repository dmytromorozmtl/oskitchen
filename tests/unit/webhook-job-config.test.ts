import { describe, expect, it } from "vitest";

import { getWebhookJobBatchSize, getWebhookJobMaxAttempts } from "@/lib/webhooks/webhook-job-config";

describe("webhook job config", () => {
  it("uses safe defaults when env unset", () => {
    expect(getWebhookJobBatchSize()).toBeGreaterThan(0);
    expect(getWebhookJobMaxAttempts()).toBeGreaterThan(0);
  });
});
