import { beforeEach, describe, expect, it, vi } from "vitest";

import { PII_ENCRYPTED_PREFIX } from "@/lib/security/pii-field";
import {
  decryptOrderPiiFields,
  encryptOrderCustomerEmail,
  presentOrderPiiFields,
  rewriteOrderEmailFilters,
} from "@/lib/orders/order-pii";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

const ENCRYPTION_KEY_B64 = Buffer.alloc(32, 7).toString("base64");

describe("order PII", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY_B64;
  });

  it("stores order email in deterministic encrypted form and decrypts it", () => {
    const encrypted = encryptOrderCustomerEmail("Owner@KitchenOS.test");
    expect(encrypted).toMatch(/^enc:order-email:v1:/);

    const decrypted = decryptOrderPiiFields({
      customerName: null,
      customerEmail: encrypted,
      customerPhone: null,
    });
    expect(decrypted.customerEmail).toBe("owner@kitchenos.test");
  });

  it("rewrites customer email filters for encrypted and legacy plaintext rows", () => {
    const where = rewriteOrderEmailFilters({
      customerEmail: {
        equals: "Owner@KitchenOS.test",
        mode: "insensitive",
      },
    });

    expect(where).toEqual({
      OR: [
        { customerEmail: encryptOrderCustomerEmail("owner@kitchenos.test") },
        {
          customerEmail: {
            equals: "owner@kitchenos.test",
            mode: "insensitive",
          },
        },
      ],
    });
  });

  it("persists encrypted order customer fields through the canonical service", async () => {
    const create = vi.fn().mockResolvedValue({
      id: "order-1",
      customerId: null,
      publicLookupToken: "lookup-1",
      total: 25,
      brandId: null,
      locationId: null,
      workspaceId: "ws-1",
    });

    await persistResolvedOrder(
      {
        userId: "user-1",
        workspaceId: "ws-1",
        db: {
          order: { create },
        } as never,
      },
      {
        orderType: "MANUAL",
        creationSource: "MANUAL",
        statusKey: "CONFIRMED",
        paymentMode: "PAY_LATER",
        workspaceId: "ws-1",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        customerPhone: "+123456789",
        fulfillmentDetail: "PICKUP",
        subtotal: 25,
        total: 25,
        lines: [
          {
            productId: null,
            title: "Manual order",
            sku: undefined,
            quantity: 1,
            unitPrice: 25,
            lineTotal: 25,
            notes: undefined,
            preparedDate: null,
            modifiersJson: null,
            sourceMappingId: null,
          },
        ],
      },
    );

    const [args] = create.mock.calls[0];
    const { data } = args as { data: Record<string, string> };
    expect(data.customerName).toMatch(new RegExp(`^${PII_ENCRYPTED_PREFIX}`));
    expect(data.customerPhone).toMatch(new RegExp(`^${PII_ENCRYPTED_PREFIX}`));
    expect(data.customerEmail).toMatch(/^enc:order-email:v1:/);
  });

  it("masks support-facing order PII by default", () => {
    const masked = presentOrderPiiFields(
      {
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        customerPhone: "+123456789",
      },
      "support_masked",
    );

    expect(masked.customerName).toBe("J*******");
    expect(masked.customerEmail).toBe("ja**@example.com");
    expect(masked.customerPhone).toBe("*****6789");
  });
});
import { describe, expect, it } from "vitest";

import { decryptOrderPiiFields, encryptOrderPiiFields } from "@/lib/orders/order-pii";

describe("order-pii", () => {
  it("round-trips plaintext when encryption disabled", () => {
    const input = {
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      customerPhone: "+15551234567",
    };
    const enc = encryptOrderPiiFields(input);
    const dec = decryptOrderPiiFields(enc);
    expect(dec).toEqual(input);
  });

  it("passes through legacy plaintext rows", () => {
    const legacy = { customerName: "Legacy Guest", customerEmail: "legacy@example.com" };
    expect(decryptOrderPiiFields(legacy)).toMatchObject(legacy);
  });
});
