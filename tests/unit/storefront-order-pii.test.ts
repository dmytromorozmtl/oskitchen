import { beforeEach, describe, expect, it } from "vitest";

import {
  buildStorefrontOrderCustomerEmailEqualsWhere,
  decryptStorefrontOrderPiiFields,
  encryptStorefrontOrderCustomerEmail,
  encryptStorefrontOrderPiiFields,
} from "@/lib/storefront/storefront-order-pii";

const ENCRYPTION_KEY_B64 = Buffer.alloc(32, 13).toString("base64");

describe("storefront order PII", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY_B64;
  });

  it("stores storefront order email in deterministic encrypted form and decrypts it", () => {
    const encrypted = encryptStorefrontOrderCustomerEmail("Guest@Example.com");
    expect(encrypted).toMatch(/^enc:storefront-order-email:v1:/);

    const decrypted = decryptStorefrontOrderPiiFields({
      customerName: null,
      customerEmail: encrypted,
      customerPhone: null,
    });
    expect(decrypted.customerEmail).toBe("guest@example.com");
  });

  it("encrypts storefront order name and phone alongside email", () => {
    const encrypted = encryptStorefrontOrderPiiFields({
      customerName: "Guest Shopper",
      customerEmail: "guest@example.com",
      customerPhone: "+15551234567",
    });

    expect(encrypted.customerName).toMatch(/^enc:v1:/);
    expect(encrypted.customerEmail).toMatch(/^enc:storefront-order-email:v1:/);
    expect(encrypted.customerPhone).toMatch(/^enc:v1:/);

    const decrypted = decryptStorefrontOrderPiiFields(encrypted);
    expect(decrypted).toEqual({
      customerName: "Guest Shopper",
      customerEmail: "guest@example.com",
      customerPhone: "+15551234567",
    });
  });

  it("builds lookup where-clause compatible with encrypted and legacy plaintext rows", () => {
    expect(
      buildStorefrontOrderCustomerEmailEqualsWhere("Guest@Example.com"),
    ).toEqual({
      OR: [
        {
          customerEmail: encryptStorefrontOrderCustomerEmail("guest@example.com"),
        },
        {
          customerEmail: {
            equals: "guest@example.com",
            mode: "insensitive",
          },
        },
      ],
    });
  });
});
