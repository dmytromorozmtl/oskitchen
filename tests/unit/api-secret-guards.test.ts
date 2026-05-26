import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import {
  requireBearerWebhookSecret,
  requireConfiguredWebhookSecret,
  verifyResendWebhookSignature,
} from "@/lib/api/webhook-guard";
import { requireStorefrontMiddlewareSecret } from "@/lib/storefront/storefront-middleware-secret";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("API secret guards", () => {
  it("fails closed when a bearer webhook secret is missing", async () => {
    const response = requireBearerWebhookSecret(new Request("https://example.com"), {
      secret: "",
    });

    expect(response?.status).toBe(503);
    await expect(response?.json()).resolves.toEqual({ error: "Webhook not configured" });
  });

  it("rejects wrong bearer webhook secrets", async () => {
    const response = requireBearerWebhookSecret(new Request("https://example.com", {
      headers: { authorization: "Bearer wrong-secret" },
    }), {
      secret: "correct-secret",
    });

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("accepts the correct bearer webhook secret", () => {
    const response = requireBearerWebhookSecret(new Request("https://example.com", {
      headers: { authorization: "Bearer correct-secret" },
    }), {
      secret: "correct-secret",
    });

    expect(response).toBeNull();
  });

  it("verifies resend-style timestamped HMAC signatures", () => {
    const rawBody = JSON.stringify({ type: "email.delivered" });
    const timestamp = "1716710400";
    const secret = "resend-secret";
    const signature = createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    expect(
      verifyResendWebhookSignature(rawBody, `t=${timestamp},v1=${signature}`, secret),
    ).toBe(true);
    expect(
      verifyResendWebhookSignature(rawBody, `t=${timestamp},v1=deadbeef`, secret),
    ).toBe(false);
  });

  it("fails closed when the storefront middleware secret is missing", async () => {
    delete process.env.STOREFRONT_MIDDLEWARE_SECRET;

    const response = requireStorefrontMiddlewareSecret(new Request("https://example.com"));

    expect(response?.status).toBe(503);
    await expect(response?.json()).resolves.toEqual({
      error: "Storefront middleware secret not configured",
    });
  });

  it("enforces the storefront middleware secret", async () => {
    process.env.STOREFRONT_MIDDLEWARE_SECRET = "mw-secret";

    const unauthorized = requireStorefrontMiddlewareSecret(new Request("https://example.com", {
      headers: { "x-kos-mw-secret": "wrong" },
    }));
    expect(unauthorized?.status).toBe(401);
    await expect(unauthorized?.json()).resolves.toEqual({ error: "Unauthorized" });

    const authorized = requireStorefrontMiddlewareSecret(new Request("https://example.com", {
      headers: { "x-kos-mw-secret": "mw-secret" },
    }));
    expect(authorized).toBeNull();
  });

  it("returns configured webhook secrets only when present", async () => {
    const missing = requireConfiguredWebhookSecret(undefined);
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.response.status).toBe(503);
      await expect(missing.response.json()).resolves.toEqual({ error: "Webhook not configured" });
    }

    const present = requireConfiguredWebhookSecret(" configured-secret ");
    expect(present).toEqual({ ok: true, secret: "configured-secret" });
  });
});
