import { beforeEach, describe, expect, it } from "vitest";

import {
  decryptStorefrontWebhookSecret,
  encryptStorefrontWebhookSecret,
  isEncryptedStorefrontWebhookSecret,
} from "@/lib/storefront/storefront-webhook-secret";

const ENCRYPTION_KEY_B64 = Buffer.alloc(32, 23).toString("base64");

describe("storefront webhook secret", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY_B64;
  });

  it("encrypts and decrypts webhook secrets at rest", () => {
    const encrypted = encryptStorefrontWebhookSecret("super-secret-value");
    expect(encrypted).toMatch(/^enc:storefront-webhook:v1:/);
    expect(isEncryptedStorefrontWebhookSecret(encrypted)).toBe(true);
    expect(decryptStorefrontWebhookSecret(encrypted)).toBe("super-secret-value");
  });

  it("keeps legacy plaintext secrets readable", () => {
    expect(decryptStorefrontWebhookSecret("legacy-plain-secret")).toBe(
      "legacy-plain-secret",
    );
    expect(isEncryptedStorefrontWebhookSecret("legacy-plain-secret")).toBe(false);
  });
});
