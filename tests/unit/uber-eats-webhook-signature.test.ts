import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";

import { verifyUberEatsWebhookSignature } from "@/services/integrations/uber-eats";

describe("verifyUberEatsWebhookSignature", () => {
  const secret = "test-webhook-secret";
  const body = '{"event_id":"evt-1","id":"order-1"}';

  it("accepts hex digest", () => {
    const sig = createHmac("sha256", secret).update(body, "utf8").digest("hex");
    expect(verifyUberEatsWebhookSignature(body, sig, secret)).toBe(true);
  });

  it("rejects wrong signature", () => {
    expect(verifyUberEatsWebhookSignature(body, "deadbeef", secret)).toBe(false);
  });

  it("rejects empty secret", () => {
    const sig = createHmac("sha256", secret).update(body, "utf8").digest("hex");
    expect(verifyUberEatsWebhookSignature(body, sig, "")).toBe(false);
  });
});
