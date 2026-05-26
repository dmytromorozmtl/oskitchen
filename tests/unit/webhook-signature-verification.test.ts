import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";

import { verifyShopifyHmac } from "@/services/integrations/shopify";
import { verifyWebhookSignature } from "@/services/integrations/woocommerce";

describe("webhook signature verification", () => {
  const secret = "test-webhook-secret";
  const body = JSON.stringify({ id: 42, status: "processing" });

  it("accepts valid WooCommerce HMAC (base64)", () => {
    const sig = createHmac("sha256", secret).update(body, "utf8").digest("base64");
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
  });

  it("rejects WooCommerce tampered body", () => {
    const sig = createHmac("sha256", secret).update(body, "utf8").digest("base64");
    expect(verifyWebhookSignature(body + "x", sig, secret)).toBe(false);
  });

  it("accepts valid Shopify HMAC (base64 header)", () => {
    const hmac = createHmac("sha256", secret).update(body, "utf8").digest("base64");
    expect(verifyShopifyHmac(body, hmac, secret)).toBe(true);
  });

  it("rejects Shopify with wrong secret", () => {
    const hmac = createHmac("sha256", secret).update(body, "utf8").digest("base64");
    expect(verifyShopifyHmac(body, hmac, "other-secret")).toBe(false);
  });
});
