import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(),
}));

import { getStripe } from "@/lib/stripe";
import { attemptStripePosRefund } from "@/services/pos/pos-stripe-refund-service";

describe("attemptStripePosRefund", () => {
  beforeEach(() => {
    vi.mocked(getStripe).mockReset();
  });

  it("skips when no payment reference", async () => {
    const r = await attemptStripePosRefund({ externalPaymentReference: null });
    expect(r).toEqual({ ok: false, skipped: true, reason: "NO_PAYMENT_REFERENCE" });
  });

  it("skips when Stripe is not configured", async () => {
    vi.mocked(getStripe).mockReturnValue(null);
    const r = await attemptStripePosRefund({ externalPaymentReference: "pi_test" });
    expect(r).toEqual({ ok: false, skipped: true, reason: "STRIPE_NOT_CONFIGURED" });
  });

  it("refunds payment intents", async () => {
    const refunds = { create: vi.fn().mockResolvedValue({ id: "re_1" }) };
    vi.mocked(getStripe).mockReturnValue({ refunds } as never);
    const r = await attemptStripePosRefund({ externalPaymentReference: "pi_abc", amountCents: 500 });
    expect(r).toEqual({ ok: true, stripeRefundId: "re_1" });
    expect(refunds.create).toHaveBeenCalledWith({ payment_intent: "pi_abc", amount: 500 }, undefined);
  });

  it("passes Stripe idempotency key when provided", async () => {
    const refunds = { create: vi.fn().mockResolvedValue({ id: "re_2" }) };
    vi.mocked(getStripe).mockReturnValue({ refunds } as never);
    await attemptStripePosRefund({
      externalPaymentReference: "pi_abc",
      idempotencyKey: "pos_refund_tx1_full",
    });
    expect(refunds.create).toHaveBeenCalledWith({ payment_intent: "pi_abc" }, { idempotencyKey: "pos_refund_tx1_full" });
  });
});
