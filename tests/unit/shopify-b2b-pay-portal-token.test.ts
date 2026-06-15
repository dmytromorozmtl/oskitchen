import { describe, expect, it } from "vitest";

import {
  DEFAULT_B2B_PAY_PORTAL_TOKEN_TTL_DAYS,
  resolveB2bPayPortalEnabled,
  resolveB2bPayPortalTokenTtlDays,
} from "@/lib/commercial/shopify-market-b2b-pay-portal";
import {
  incrementB2bPayPortalStats,
  openB2bInvoiceAmountCents,
  patchInvoiceDraftPayPortalIssued,
} from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import {
  buildB2bPayPortalUrl,
  mintB2bPayPortalToken,
  verifyB2bPayPortalToken,
} from "@/lib/integrations/shopify-b2b-pay-portal-token";

const draft = {
  invoiceId: "inv-1",
  invoiceNumber: "B2B-20260601-A1B2C3D4",
  status: "draft" as const,
  amountCents: 50000,
  currency: "usd",
  dueAt: "2026-07-01T02:00:00.000Z",
  generatedAt: "2026-06-01T03:00:00.000Z",
  paymentTermsLabel: "Net 30",
  poNumber: "PO-100",
  companyName: "Office Lunch Co",
};

describe("shopify-b2b-pay-portal-token", () => {
  it("mints and verifies signed pay portal tokens", () => {
    const token = mintB2bPayPortalToken({
      orderId: "order-1",
      invoiceId: "inv-1",
      userId: "user-1",
      ttlDays: 30,
    });
    const payload = verifyB2bPayPortalToken(token);
    expect(payload?.orderId).toBe("order-1");
    expect(payload?.invoiceId).toBe("inv-1");
    expect(payload?.userId).toBe("user-1");
  });

  it("rejects tampered tokens", () => {
    const token = mintB2bPayPortalToken({
      orderId: "order-1",
      invoiceId: "inv-1",
      userId: "user-1",
    });
    expect(verifyB2bPayPortalToken(`${token}x`)).toBeNull();
  });

  it("builds pay portal urls", () => {
    const url = buildB2bPayPortalUrl("abc.def", "https://app.example.com");
    expect(url).toBe("https://app.example.com/pay/b2b/abc.def");
  });

  it("defaults portal enabled and ttl", () => {
    expect(resolveB2bPayPortalEnabled(undefined)).toBe(true);
    expect(resolveB2bPayPortalEnabled(false)).toBe(false);
    expect(resolveB2bPayPortalTokenTtlDays(null)).toBe(DEFAULT_B2B_PAY_PORTAL_TOKEN_TTL_DAYS);
    expect(resolveB2bPayPortalTokenTtlDays(45)).toBe(45);
  });

  it("computes open invoice balance", () => {
    expect(openB2bInvoiceAmountCents(draft)).toBe(50000);
    expect(
      openB2bInvoiceAmountCents({ ...draft, paidAmountCents: 20000, status: "partial" }),
    ).toBe(30000);
  });

  it("patches pay portal issued metadata", () => {
    const next = patchInvoiceDraftPayPortalIssued(draft, "2026-06-01T12:00:00.000Z");
    expect(next.payPortalIssuedAt).toBe("2026-06-01T12:00:00.000Z");
  });

  it("increments pay portal stats", () => {
    const next = incrementB2bPayPortalStats(null, { linksMinted: 1, checkoutCompleted: 1 });
    expect(next.linksMinted).toBe(1);
    expect(next.checkoutCompleted).toBe(1);
  });
});
