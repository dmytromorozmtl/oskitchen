import { describe, expect, it } from "vitest";

import { verifyStripeIntegrationWebhook } from "@/services/integrations/stripe/webhook-handler.service";

describe("stripe integration webhook", () => {
  it("rejects when webhook secret missing", () => {
    const original = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    try {
      const result = verifyStripeIntegrationWebhook("{}", "sig");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("not configured");
    } finally {
      if (original) process.env.STRIPE_WEBHOOK_SECRET = original;
    }
  });
});
