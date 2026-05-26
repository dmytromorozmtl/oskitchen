import { describe, expect, it } from "vitest";

import { publicApiOrderCreateSchema } from "@/lib/orders/public-api-order-create";
import { orderCustomerFieldsSchema } from "@/lib/orders/order-customer-fields";

describe("publicApiOrderCreateSchema", () => {
  it("rejects invalid email like dashboard validation", () => {
    const r = publicApiOrderCreateSchema.safeParse({
      customerName: "Test",
      customerEmail: "not-an-email",
      total: 10,
    });
    expect(r.success).toBe(false);
  });

  it("accepts valid minimal order", () => {
    const r = publicApiOrderCreateSchema.safeParse({
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      total: 42.5,
      fulfillmentType: "PICKUP",
    });
    expect(r.success).toBe(true);
  });

  it("shares customer field limits with orderCustomerFieldsSchema", () => {
    expect(publicApiOrderCreateSchema.shape.customerName).toBe(orderCustomerFieldsSchema.shape.customerName);
    expect(publicApiOrderCreateSchema.shape.customerEmail).toBe(orderCustomerFieldsSchema.shape.customerEmail);
  });
});
