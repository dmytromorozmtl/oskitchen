import { describe, expect, it } from "vitest";

import {
  appendInvoiceDraftToB2bMetadata,
  buildB2bInvoiceNumber,
  computeB2bInvoiceDueAt,
  incrementB2bInvoiceStats,
  readB2bInvoiceDraftLink,
} from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import type { KitchenOrderB2bMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import { resolveB2bAutoGenerateInvoice } from "@/lib/commercial/shopify-market-b2b-invoice";

const b2b: KitchenOrderB2bMetadata = {
  status: "complete",
  companyAccountId: "acc-1",
  osMarketId: "us",
  shopifyCompanyId: "gid://shopify/Company/1",
  shopifyLocationId: "gid://shopify/CompanyLocation/9",
  companyName: "Office Lunch Co",
  locationName: "HQ",
  orderNotesBadge: "B2B · Office Lunch Co · Net 30",
  routingSummary: "company=1",
  enrichedAt: "2026-06-01T01:00:00.000Z",
  promotedAt: "2026-06-01T02:00:00.000Z",
  missingCompanyLink: false,
  poNumber: "PO-9001",
  paymentTerms: { name: "Net 30", type: "net", dueInDays: 30, label: "Net 30" },
  missingPo: false,
};

describe("shopify-b2b-invoice-draft-metadata", () => {
  it("builds stable invoice numbers from order id and date", () => {
    expect(
      buildB2bInvoiceNumber({
        orderId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        generatedAt: "2026-06-01T12:00:00.000Z",
      }),
    ).toBe("B2B-20260601-A1B2C3D4");
  });

  it("computes due date from net terms", () => {
    expect(
      computeB2bInvoiceDueAt({
        anchorAt: "2026-06-01T02:00:00.000Z",
        paymentTerms: { name: "Net 30", type: "net", dueInDays: 30, label: "Net 30" },
      }),
    ).toBe("2026-07-01T02:00:00.000Z");
  });

  it("reads and writes invoice draft on order metadata", () => {
    const link = {
      invoiceId: "inv-1",
      invoiceNumber: "B2B-20260601-A1B2C3D4",
      status: "draft" as const,
      amountCents: 45000,
      currency: "usd",
      dueAt: "2026-07-01T02:00:00.000Z",
      generatedAt: "2026-06-01T03:00:00.000Z",
      paymentTermsLabel: "Net 30",
      poNumber: "PO-9001",
      companyName: "Office Lunch Co",
    };
    const source = {
      provider: "shopify",
      channelImport: true,
      b2b: appendInvoiceDraftToB2bMetadata(b2b, link),
    };
    expect(readB2bInvoiceDraftLink(source)?.invoiceNumber).toBe("B2B-20260601-A1B2C3D4");
  });

  it("increments invoice stats", () => {
    const next = incrementB2bInvoiceStats(null, { draftsCreated: 1, skippedNoTerms: 2 });
    expect(next.draftsCreated).toBe(1);
    expect(next.skippedNoTerms).toBe(2);
  });

  it("defaults auto-generate invoice to enabled unless explicitly false", () => {
    expect(resolveB2bAutoGenerateInvoice(undefined)).toBe(true);
    expect(resolveB2bAutoGenerateInvoice(true)).toBe(true);
    expect(resolveB2bAutoGenerateInvoice(false)).toBe(false);
  });
});
