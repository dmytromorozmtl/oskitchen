import { describe, expect, it } from "vitest";

import { parseDlqWebhookUrl } from "@/lib/storefront/validate-dlq-webhook-url";

describe("parseDlqWebhookUrl", () => {
  it("rejects placeholder", () => {
    expect(parseDlqWebhookUrl("...").ok).toBe(false);
  });

  it("accepts https slack webhook", () => {
    const r = parseDlqWebhookUrl("https://hooks.slack.com/services/T/B/x");
    expect(r.ok).toBe(true);
  });
});
