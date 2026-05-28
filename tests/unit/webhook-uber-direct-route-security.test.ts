import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("Uber Direct webhook route security", () => {
  it("uses bearer guard, ingress dedupe, and remains placeholder", () => {
    const handler = readFileSync(
      join(process.cwd(), "lib/webhooks/uber-direct-webhook-handler.ts"),
      "utf8",
    );
    expect(handler).toContain("requireBearerWebhookSecret");
    expect(handler).toContain("UBER_DIRECT_WEBHOOK_SECRET");
    expect(handler).toContain("recordWebhookIngressOrDuplicate");
    expect(handler).toContain("duplicate: true");
    expect(handler).toContain("uber_direct_placeholder");
  });

  it("keeps slack handler on signature verification and ingress dedupe", () => {
    const handler = readFileSync(
      join(process.cwd(), "lib/webhooks/slack-experiment-interactive-handler.ts"),
      "utf8",
    );
    expect(handler).toContain("verifySlackRequestSignature");
    expect(handler).toContain("Invalid signature");
    expect(handler).toContain("recordWebhookIngressOrDuplicate");
    expect(handler).toContain("duplicate: true");
  });
});
