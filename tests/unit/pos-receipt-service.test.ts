import { describe, expect, it } from "vitest";

import { buildPosReceiptText } from "@/services/pos/pos-receipt-service";

const base = {
  receiptNumber: "POS-TEST-1",
  businessName: null,
  orderId: "00000000-0000-4000-8000-000000000001",
  lines: [{ title: "Coffee", quantity: 2, unitPrice: 3.5, lineTotal: 7 }],
  subtotal: 7,
  tax: 0,
  discount: 0,
  total: 7,
  paymentMode: "CASH" as const,
  fulfillment: "PICKUP",
};

describe("buildPosReceiptText", () => {
  it("omits customer line when customerSummary is absent", () => {
    const text = buildPosReceiptText(base);
    expect(text).not.toContain("Customer:");
    expect(text).toContain(`Order: ${base.orderId}`);
    expect(text).toContain("2× Coffee @ 3.50 = 7.00");
    expect(text).toContain("Total: 7.00");
  });

  it("includes customer line after order id when customerSummary is set", () => {
    const text = buildPosReceiptText({
      ...base,
      customerSummary: "Jane Doe (jane@example.com)",
    });
    const idxOrder = text.indexOf(`Order: ${base.orderId}`);
    const idxCustomer = text.indexOf("Customer: Jane Doe (jane@example.com)");
    const idxFulfillment = text.indexOf("Fulfillment:");
    expect(idxOrder).toBeGreaterThanOrEqual(0);
    expect(idxCustomer).toBeGreaterThan(idxOrder);
    expect(idxFulfillment).toBeGreaterThan(idxCustomer);
  });

  it("ignores whitespace-only customerSummary", () => {
    const text = buildPosReceiptText({
      ...base,
      customerSummary: "   \n\t  ",
    });
    expect(text).not.toContain("Customer:");
  });
});
