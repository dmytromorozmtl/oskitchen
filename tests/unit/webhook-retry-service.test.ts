import { describe, expect, it } from "vitest";

import { webhookRetryDelayMs } from "@/services/webhooks/webhook-retry-service";

describe("webhookRetryDelayMs", () => {
  it("grows with attempts and stays capped", () => {
    const a1 = webhookRetryDelayMs(1);
    const a4 = webhookRetryDelayMs(4);
    expect(a4).toBeGreaterThanOrEqual(a1);
    expect(webhookRetryDelayMs(20)).toBeLessThanOrEqual(15 * 60 * 1000 + 600);
  });
});
