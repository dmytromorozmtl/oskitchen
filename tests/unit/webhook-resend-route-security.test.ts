import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("Resend webhook route security", () => {
  it("verifies signature, ingress dedupe, and provider event idempotency", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/webhooks/resend/route.ts"),
      "utf8",
    );
    expect(route).toContain("verifyResendWebhookSignature");
    expect(route).toContain("invalid_signature");
    expect(route).toContain("recordWebhookIngressOrDuplicate");
    expect(route).toContain("WEBHOOK_INGRESS_ROUTE_KEYS.RESEND");
    expect(route).toContain("duplicate: true");
    expect(route).toContain("notificationEvent.findUnique");
  });
});
