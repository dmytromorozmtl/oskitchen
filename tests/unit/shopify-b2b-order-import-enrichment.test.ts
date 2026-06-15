import { describe, expect, it } from "vitest";

import { ChannelRecordValidationStatus } from "@prisma/client";

import type { ShopifyMarketsSyncSettings } from "@/lib/integrations/shopify-markets-settings";
import {
  adjustValidationForB2bEnrichment,
  buildShopifyB2bOrderImportEnrichment,
  incrementB2bOrderEnrichmentStats,
} from "@/services/integrations/shopify-b2b-order-import-enrichment-service";

const marketsSync = {
  b2bCompanyLinks: { "gid://shopify/Company/1": "acc-1" },
  b2bLocationLinks: {
    "gid://shopify/CompanyLocation/9": {
      shopifyLocationId: "gid://shopify/CompanyLocation/9",
      shopifyCompanyId: "gid://shopify/Company/1",
      osMarketId: "us",
      companyAccountId: "acc-1",
      linkedAt: "2026-06-01T00:00:00.000Z",
    },
  },
  b2bCompanyImports: {
    "gid://shopify/Company/1": {
      shopifyCompanyId: "gid://shopify/Company/1",
      name: "Office Lunch Co",
      externalId: null,
      mainContactEmail: "ap@office.com",
      locationCount: 1,
      locationCountries: ["US"],
      suggestedCompanyAccountId: "acc-1",
      importedAt: "2026-06-01T00:00:00.000Z",
      companyHash: "abc",
    },
  },
  b2bLocationImports: {
    "gid://shopify/CompanyLocation/9": {
      shopifyLocationId: "gid://shopify/CompanyLocation/9",
      shopifyCompanyId: "gid://shopify/Company/1",
      companyName: "Office Lunch Co",
      locationName: "HQ",
      countryCode: "US",
      city: "Austin",
      suggestedOsMarketId: "us",
      suggestedCompanyAccountId: "acc-1",
      importedAt: "2026-06-01T00:00:00.000Z",
      locationHash: "def",
    },
  },
} as unknown as ShopifyMarketsSyncSettings;

describe("shopify-b2b-order-import-enrichment", () => {
  it("builds complete enrichment for linked B2B order", () => {
    const enrichment = buildShopifyB2bOrderImportEnrichment({
      order: { company: { id: 1, location_id: 9 } },
      marketsSync,
      now: "2026-06-01T01:00:00.000Z",
    });

    expect(enrichment?.status).toBe("complete");
    expect(enrichment?.companyName).toBe("Office Lunch Co");
    expect(enrichment?.locationName).toBe("HQ");
    expect(enrichment?.osMarketId).toBe("us");
    expect(enrichment?.orderNotesBadge).toContain("B2B");
    expect(enrichment?.orderNotesBadge).toContain("→ us");
  });

  it("marks unresolved when links missing", () => {
    const enrichment = buildShopifyB2bOrderImportEnrichment({
      order: { company: { id: 2, location_id: 99 } },
      marketsSync: {
        b2bCompanyLinks: {},
        b2bLocationLinks: {},
        b2bCompanyImports: {},
        b2bLocationImports: {},
      } as unknown as ShopifyMarketsSyncSettings,
    });

    expect(enrichment?.status).toBe("unresolved");
    expect(enrichment?.missingPieces).toContain("company_account");
    expect(enrichment?.missingPieces).toContain("os_market");
  });

  it("downgrades validation to WARNING for partial routing", () => {
    const enrichment = buildShopifyB2bOrderImportEnrichment({
      order: { company: { id: 1, location_id: 9 } },
      marketsSync: {
        ...marketsSync,
        b2bLocationLinks: {
          "gid://shopify/CompanyLocation/9": {
            ...marketsSync.b2bLocationLinks["gid://shopify/CompanyLocation/9"],
            osMarketId: null,
          },
        },
      } as unknown as ShopifyMarketsSyncSettings,
    });

    expect(
      adjustValidationForB2bEnrichment({
        base: ChannelRecordValidationStatus.VALID,
        enrichment: enrichment!,
      }),
    ).toBe(ChannelRecordValidationStatus.WARNING);
  });

  it("increments enrichment stats", () => {
    const next = incrementB2bOrderEnrichmentStats(null, "complete");
    expect(next).toEqual({ complete: 1, partial: 0, unresolved: 0, total: 1 });
    const partial = incrementB2bOrderEnrichmentStats(next, "partial");
    expect(partial.total).toBe(2);
    expect(partial.partial).toBe(1);
  });

  it("includes net terms and PO on enrichment badge", () => {
    const enrichment = buildShopifyB2bOrderImportEnrichment({
      order: {
        company: { id: 1, location_id: 9 },
        po_number: "PO-100",
        payment_terms: { payment_terms_name: "Net 30", due_in_days: 30 },
      },
      marketsSync,
    });
    expect(enrichment?.poNumber).toBe("PO-100");
    expect(enrichment?.paymentTerms?.label).toBe("Net 30");
    expect(enrichment?.orderNotesBadge).toContain("PO#PO-100");
    expect(enrichment?.orderNotesBadge).toContain("Net 30");
  });

  it("flags missing PO when required by workspace policy", () => {
    const enrichment = buildShopifyB2bOrderImportEnrichment({
      order: { company: { id: 1, location_id: 9 } },
      marketsSync: { ...marketsSync, b2bRequirePurchaseOrder: true } as ShopifyMarketsSyncSettings,
    });
    expect(enrichment?.missingPo).toBe(true);
    expect(enrichment?.missingPieces).toContain("po_number");
    expect(
      adjustValidationForB2bEnrichment({
        base: ChannelRecordValidationStatus.VALID,
        enrichment: enrichment!,
      }),
    ).toBe(ChannelRecordValidationStatus.WARNING);
  });
});
