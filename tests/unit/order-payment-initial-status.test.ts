import { describe, expect, it } from "vitest";

import { initialOrderPaymentStatusFromMode } from "@/lib/orders/order-payment";

describe("initialOrderPaymentStatusFromMode", () => {
  it("never marks Stripe or card terminal placeholders as PAID", () => {
    expect(initialOrderPaymentStatusFromMode("STRIPE_PLACEHOLDER")).toBe("PENDING");
    expect(initialOrderPaymentStatusFromMode("CARD_TERMINAL_PLACEHOLDER")).toBe("PENDING");
  });

  it("marks cash, external, and comped sales as PAID for operational tracking", () => {
    expect(initialOrderPaymentStatusFromMode("CASH")).toBe("PAID");
    expect(initialOrderPaymentStatusFromMode("PAID_EXTERNALLY")).toBe("PAID");
    expect(initialOrderPaymentStatusFromMode("COMPED")).toBe("PAID");
  });

  it("marks request-only as NOT_REQUIRED", () => {
    expect(initialOrderPaymentStatusFromMode("REQUEST_ONLY")).toBe("NOT_REQUIRED");
  });

  it("defaults pay-later and manual invoice to UNPAID", () => {
    expect(initialOrderPaymentStatusFromMode("PAY_LATER")).toBe("UNPAID");
    expect(initialOrderPaymentStatusFromMode("MANUAL_INVOICE")).toBe("UNPAID");
  });
});
