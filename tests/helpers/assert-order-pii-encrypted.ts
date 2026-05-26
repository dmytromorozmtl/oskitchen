import { expect } from "vitest";

import { decryptOrderPiiFields } from "@/lib/orders/order-pii";

type StoredOrderPii = {
  workspaceId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone?: string | null;
};

type ExpectedOrderPii = {
  workspaceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
};

export function assertOrderPiiEncrypted(
  order: StoredOrderPii,
  expected: ExpectedOrderPii,
): void {
  expect(order.workspaceId).toBe(expected.workspaceId);
  expect(order.customerName).toMatch(/^enc:v1:/);
  expect(order.customerEmail).toMatch(/^enc:order-email:v1:/);

  if (expected.customerPhone) {
    expect(order.customerPhone).toMatch(/^enc:v1:/);
  } else {
    expect(order.customerPhone ?? null).toBeNull();
  }

  const decrypted = decryptOrderPiiFields({
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
  });

  expect(decrypted.customerName).toBe(expected.customerName);
  expect(decrypted.customerEmail).toBe(expected.customerEmail);
  expect(decrypted.customerPhone ?? null).toBe(expected.customerPhone ?? null);
}
