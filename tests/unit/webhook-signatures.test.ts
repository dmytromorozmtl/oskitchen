import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { verifyDoorDashWebhookSignature } from "@/services/integrations/doordash/doordash-marketplace";
import { verifyGrubhubWebhookSignature } from "@/services/integrations/grubhub/grubhub-marketplace";
import { verifyShopifyHmac } from "@/services/integrations/shopify";
import { verifyUberEatsWebhookSignature } from "@/services/integrations/uber-eats";

/**
 * Non-Stripe marketplace webhook signature verification — DoorDash, Grubhub, Uber Eats, Shopify.
 *
 * @see artifacts/webhook-signature-matrix.md
 * @see tests/unit/webhook-signature-verification.test.ts (WooCommerce)
 */

const ROOT = process.cwd();
const readRoute = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

const sampleBody = JSON.stringify({ event_id: "evt-1", order: { id: "order-1" } });

describe("non-Stripe webhook signatures — DoorDash", () => {
  const secret = "dd-webhook-secret";

  it("accepts hex, v1=, and sha256= prefixed digests", () => {
    const hex = createHmac("sha256", secret).update(sampleBody, "utf8").digest("hex");
    expect(verifyDoorDashWebhookSignature(sampleBody, hex, secret)).toBe(true);
    expect(verifyDoorDashWebhookSignature(sampleBody, `v1=${hex}`, secret)).toBe(true);
    expect(verifyDoorDashWebhookSignature(sampleBody, `sha256=${hex}`, secret)).toBe(true);
  });

  it("accepts base64 digest", () => {
    const b64 = createHmac("sha256", secret).update(sampleBody, "utf8").digest("base64");
    expect(verifyDoorDashWebhookSignature(sampleBody, b64, secret)).toBe(true);
  });

  it("rejects tampered body, wrong secret, and empty inputs", () => {
    const hex = createHmac("sha256", secret).update(sampleBody, "utf8").digest("hex");
    expect(verifyDoorDashWebhookSignature(`${sampleBody}x`, hex, secret)).toBe(false);
    expect(verifyDoorDashWebhookSignature(sampleBody, hex, "other-secret")).toBe(false);
    expect(verifyDoorDashWebhookSignature(sampleBody, "", secret)).toBe(false);
    expect(verifyDoorDashWebhookSignature(sampleBody, hex, "")).toBe(false);
  });

  it("orders route calls verifyDoorDashWebhookSignature before processing", () => {
    const route = readRoute("app/api/webhooks/doordash/orders/route.ts");
    expect(route).toContain("verifyDoorDashWebhookSignature");
    expect(route).toContain("x-doordash-signature");
  });
});

describe("non-Stripe webhook signatures — Grubhub", () => {
  const secret = "gh-webhook-secret";

  it("accepts hex and sha256= prefixed digests", () => {
    const hex = createHmac("sha256", secret).update(sampleBody, "utf8").digest("hex");
    expect(verifyGrubhubWebhookSignature(sampleBody, hex, secret)).toBe(true);
    expect(verifyGrubhubWebhookSignature(sampleBody, `sha256=${hex}`, secret)).toBe(true);
  });

  it("accepts base64 digest", () => {
    const b64 = createHmac("sha256", secret).update(sampleBody, "utf8").digest("base64");
    expect(verifyGrubhubWebhookSignature(sampleBody, b64, secret)).toBe(true);
  });

  it("rejects tampered body and wrong secret", () => {
    const hex = createHmac("sha256", secret).update(sampleBody, "utf8").digest("hex");
    expect(verifyGrubhubWebhookSignature(`${sampleBody}x`, hex, secret)).toBe(false);
    expect(verifyGrubhubWebhookSignature(sampleBody, hex, "other-secret")).toBe(false);
  });

  it("orders route calls verifyGrubhubWebhookSignature before processing", () => {
    const route = readRoute("app/api/webhooks/grubhub/orders/route.ts");
    expect(route).toContain("verifyGrubhubWebhookSignature");
    expect(route).toContain("x-grubhub-signature");
  });
});

describe("non-Stripe webhook signatures — Uber Eats", () => {
  const secret = "uber-eats-webhook-secret";

  it("accepts hex and sha256= prefixed digests", () => {
    const hex = createHmac("sha256", secret).update(sampleBody, "utf8").digest("hex");
    expect(verifyUberEatsWebhookSignature(sampleBody, hex, secret)).toBe(true);
    expect(verifyUberEatsWebhookSignature(sampleBody, `sha256=${hex}`, secret)).toBe(true);
  });

  it("accepts base64 digest", () => {
    const b64 = createHmac("sha256", secret).update(sampleBody, "utf8").digest("base64");
    expect(verifyUberEatsWebhookSignature(sampleBody, b64, secret)).toBe(true);
  });

  it("rejects tampered body, wrong secret, and empty secret", () => {
    const hex = createHmac("sha256", secret).update(sampleBody, "utf8").digest("hex");
    expect(verifyUberEatsWebhookSignature(`${sampleBody}x`, hex, secret)).toBe(false);
    expect(verifyUberEatsWebhookSignature(sampleBody, hex, "other-secret")).toBe(false);
    expect(verifyUberEatsWebhookSignature(sampleBody, hex, "")).toBe(false);
  });

  it("orders route calls verifyUberEatsWebhookSignature before processing", () => {
    const route = readRoute("app/api/webhooks/uber-eats/orders/route.ts");
    expect(route).toContain("verifyUberEatsWebhookSignature");
    expect(route).toContain("x-uber-signature");
  });
});

describe("non-Stripe webhook signatures — Shopify", () => {
  const secret = "shopify-webhook-secret";

  it("accepts valid base64 HMAC header", () => {
    const hmac = createHmac("sha256", secret).update(sampleBody, "utf8").digest("base64");
    expect(verifyShopifyHmac(sampleBody, hmac, secret)).toBe(true);
  });

  it("rejects tampered body and wrong secret", () => {
    const hmac = createHmac("sha256", secret).update(sampleBody, "utf8").digest("base64");
    expect(verifyShopifyHmac(`${sampleBody}x`, hmac, secret)).toBe(false);
    expect(verifyShopifyHmac(sampleBody, hmac, "other-secret")).toBe(false);
  });

  it("shopify handler verifies HMAC before enqueue", () => {
    const handler = readRoute("lib/webhooks/shopify-handler.ts");
    expect(handler).toContain("verifyShopifyHmac");
    expect(handler).toContain("x-shopify-hmac-sha256");
  });
});
