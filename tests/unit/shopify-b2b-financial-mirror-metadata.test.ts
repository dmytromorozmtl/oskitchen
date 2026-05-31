import { describe, expect, it } from "vitest";

import {
  extractShopifyFinancialStatusFromRaw,
  incrementB2bFinancialMirrorStats,
  isB2bShopifyPaymentDrift,
  patchShopifyFinancialStatusInSourceMetadata,
  readShopifyFinancialStatus,
} from "@/lib/integrations/shopify-b2b-financial-mirror-metadata";
import { buildKitchenOrderB2bMetadata, buildKitchenOrderB2bSourceMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import type { ShopifyB2bOrderImportEnrichment } from "@/services/integrations/shopify-b2b-order-import-enrichment-service";
import { IntegrationProvider } from "@prisma/client";

const enrichment = {
  status: "complete",
  shopifyCompanyId: "1",
  shopifyLocationId: "9",
  companyAccountId: "acc-1",
  osMarketId: "us",
  routingSummary: "company=1",
  companyName: "Office Lunch Co",
  locationName: "HQ",
  orderNotesBadge: "B2B",
  marketLabel: "market:us",
  companyAccountLabel: "companyAccount:acc-1",
  routingStale: false,
  missingPieces: [],
  enrichedAt: "2026-06-01T01:00:00.000Z",
  resolvedAt: "2026-06-01T01:00:00.000Z",
  poNumber: "PO-1",
  paymentTerms: null,
  missingPo: false,
} as ShopifyB2bOrderImportEnrichment;

describe("shopify-b2b-financial-mirror-metadata", () => {
  it("extracts GraphQL and REST financial status from raw payloads", () => {
    expect(
      extractShopifyFinancialStatusFromRaw({ displayFinancialStatus: "PENDING" }),
    ).toBe("PENDING");
    expect(extractShopifyFinancialStatusFromRaw({ financial_status: "paid" })).toBe("PAID");
    expect(extractShopifyFinancialStatusFromRaw({})).toBeNull();
  });

  it("persists mirror fields on B2B source metadata at root and nested b2b", () => {
    const metadata = buildKitchenOrderB2bMetadata(enrichment);
    const source = buildKitchenOrderB2bSourceMetadata({
      provider: IntegrationProvider.SHOPIFY,
      enrichment: metadata,
      externalOrderId: "1001",
      shopifyFinancialStatus: "PENDING",
      shopifyFinancialStatusCapturedAt: "2026-06-01T02:00:00.000Z",
    });
    expect(readShopifyFinancialStatus(source)).toBe("PENDING");
    expect((source.b2b as Record<string, unknown>).shopifyFinancialStatus).toBe("PENDING");
  });

  it("patches existing source metadata without dropping b2b block", () => {
    const base = { b2b: { companyName: "Office Lunch Co" }, externalOrderId: "1001" };
    const next = patchShopifyFinancialStatusInSourceMetadata(base, "PAID", "2026-06-01T03:00:00.000Z");
    expect(readShopifyFinancialStatus(next)).toBe("PAID");
    expect((next.b2b as Record<string, unknown>).companyName).toBe("Office Lunch Co");
  });

  it("detects KitchenOS vs Shopify payment drift", () => {
    expect(isB2bShopifyPaymentDrift("UNPAID", "PENDING")).toBe(false);
    expect(isB2bShopifyPaymentDrift("UNPAID", "PAID")).toBe(true);
    expect(isB2bShopifyPaymentDrift("PAID", "PENDING")).toBe(true);
    expect(isB2bShopifyPaymentDrift("PARTIAL", "PARTIALLY_PAID")).toBe(false);
    expect(isB2bShopifyPaymentDrift("UNPAID", null)).toBe(false);
  });

  it("increments mirror stats", () => {
    const next = incrementB2bFinancialMirrorStats(null, {
      capturedAtPromote: 2,
      refreshed: 5,
      lastDriftCount: 1,
    });
    expect(next.capturedAtPromote).toBe(2);
    expect(next.refreshed).toBe(5);
    expect(next.lastDriftCount).toBe(1);
  });
});
