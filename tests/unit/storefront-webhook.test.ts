import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";

import { signStorefrontWebhookPayload } from "@/lib/storefront/storefront-webhook";

describe("signStorefrontWebhookPayload", () => {
  it("matches HMAC-SHA256 over timestamp.body", () => {
    const secret = "whsec_test";
    const body = JSON.stringify({ event: "storefront.page.published" });
    const timestamp = "1710000000";
    const expected = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
    expect(signStorefrontWebhookPayload(secret, body, timestamp)).toBe(expected);
  });

  it("changes when body or timestamp changes", () => {
    const secret = "whsec_test";
    const a = signStorefrontWebhookPayload(secret, '{"a":1}', "1");
    const b = signStorefrontWebhookPayload(secret, '{"a":2}', "1");
    const c = signStorefrontWebhookPayload(secret, '{"a":1}', "2");
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });
});
