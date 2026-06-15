import { describe, expect, it } from "vitest";

import {
  B2B_CONSOLIDATED_PAY_MAX_INVOICES,
  B2B_CONSOLIDATED_PAY_MIN_INVOICES,
  B2B_CONSOLIDATED_PAY_STALE_CHECKOUT_MS,
  resolveB2bConsolidatedPayEnabled,
} from "@/lib/commercial/shopify-market-b2b-consolidated-pay";
import {
  countStaleConsolidatedPayCheckouts,
  incrementB2bConsolidatedPayStats,
  upsertB2bConsolidatedPayBatch,
} from "@/lib/integrations/shopify-b2b-consolidated-pay-metadata";
import {
  buildB2bConsolidatedPayUrl,
  mintB2bConsolidatedPayBatchId,
  mintB2bConsolidatedPayToken,
  verifyB2bConsolidatedPayToken,
} from "@/lib/integrations/shopify-b2b-consolidated-pay-token";

describe("shopify-b2b-consolidated-pay", () => {
  it("mints and verifies consolidated pay tokens", () => {
    const batchId = mintB2bConsolidatedPayBatchId();
    const token = mintB2bConsolidatedPayToken({
      batchId,
      orderIds: ["order-1", "order-2"],
      userId: "user-1",
      ttlDays: 30,
    });
    const payload = verifyB2bConsolidatedPayToken(token);
    expect(payload?.batchId).toBe(batchId);
    expect(payload?.orderIds).toEqual(["order-1", "order-2"]);
    expect(payload?.userId).toBe("user-1");
    expect(payload?.v).toBe(2);
  });

  it("builds consolidated pay urls", () => {
    const url = buildB2bConsolidatedPayUrl("abc.def", "https://app.example.com");
    expect(url).toBe("https://app.example.com/pay/b2b/batch/abc.def");
  });

  it("tracks batch records and stale checkouts", () => {
    const batch = {
      batchId: "batch-1",
      orderIds: ["o1", "o2"],
      invoiceIds: ["i1", "i2"],
      invoiceNumbers: ["B2B-1", "B2B-2"],
      totalAmountCents: 100000,
      currency: "usd",
      companyName: "Office Lunch Co",
      mintedAt: "2026-06-01T00:00:00.000Z",
      checkoutStartedAt: new Date(Date.now() - B2B_CONSOLIDATED_PAY_STALE_CHECKOUT_MS - 1000).toISOString(),
      checkoutCompletedAt: null,
    };
    const batches = upsertB2bConsolidatedPayBatch({}, batch);
    expect(batches["batch-1"]?.batchId).toBe("batch-1");
    expect(countStaleConsolidatedPayCheckouts(batches)).toBe(1);
  });

  it("defaults consolidated pay enabled", () => {
    expect(resolveB2bConsolidatedPayEnabled(undefined)).toBe(true);
    expect(resolveB2bConsolidatedPayEnabled(false)).toBe(false);
  });

  it("increments consolidated pay stats", () => {
    const next = incrementB2bConsolidatedPayStats(null, {
      batchesMinted: 1,
      checkoutCompleted: 1,
      staleCheckoutOpen: 2,
    });
    expect(next.batchesMinted).toBe(1);
    expect(next.staleCheckoutOpen).toBe(2);
  });

  it("enforces invoice count bounds", () => {
    expect(B2B_CONSOLIDATED_PAY_MIN_INVOICES).toBe(2);
    expect(B2B_CONSOLIDATED_PAY_MAX_INVOICES).toBe(10);
  });
});
