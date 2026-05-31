import { describe, expect, it } from "vitest";

import {
  buildKitchenOrderB2bChannelTrace,
  buildKitchenOrderB2bMetadata,
  buildKitchenOrderB2bSourceMetadata,
  incrementB2bKitchenOrderStats,
  readKitchenOrderB2bMetadata,
} from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import type { ShopifyB2bOrderImportEnrichment } from "@/services/integrations/shopify-b2b-order-import-enrichment-service";
import { IntegrationProvider } from "@prisma/client";

const enrichment = {
  status: "complete",
  shopifyCompanyId: "gid://shopify/Company/1",
  shopifyLocationId: "gid://shopify/CompanyLocation/9",
  companyAccountId: "acc-1",
  osMarketId: "us",
  routingSummary: "company=1 · market=us",
  companyName: "Office Lunch Co",
  locationName: "HQ",
  orderNotesBadge: "B2B · Office Lunch Co · HQ · → us",
  marketLabel: "market:us",
  companyAccountLabel: "companyAccount:acc-1",
  routingStale: false,
  missingPieces: [],
  enrichedAt: "2026-06-01T01:00:00.000Z",
  resolvedAt: "2026-06-01T01:00:00.000Z",
} as ShopifyB2bOrderImportEnrichment;

describe("shopify-b2b-kitchen-order-metadata", () => {
  it("builds source and channel trace metadata", () => {
    const metadata = buildKitchenOrderB2bMetadata(enrichment, "2026-06-01T02:00:00.000Z");
    expect(metadata.missingCompanyLink).toBe(false);

    const source = buildKitchenOrderB2bSourceMetadata({
      provider: IntegrationProvider.SHOPIFY,
      enrichment: metadata,
      externalOrderId: "1001",
      externalOrderNumber: "#1001",
    });
    expect(source.b2b).toEqual(metadata);
    expect(source.channelImport).toBe(true);

    const trace = buildKitchenOrderB2bChannelTrace({
      provider: IntegrationProvider.SHOPIFY,
      enrichment: metadata,
      batchId: "batch-1",
      connectionId: "conn-1",
    });
    expect(trace.marketId).toBe("us");
    expect(trace.companyAccountId).toBe("acc-1");
  });

  it("reads b2b metadata back from order sourceMetadataJson", () => {
    const metadata = buildKitchenOrderB2bMetadata(enrichment);
    const source = buildKitchenOrderB2bSourceMetadata({
      provider: IntegrationProvider.SHOPIFY,
      enrichment: metadata,
      externalOrderId: "1001",
    });
    expect(readKitchenOrderB2bMetadata(source)?.orderNotesBadge).toContain("B2B");
  });

  it("increments kitchen order stats", () => {
    const metadata = buildKitchenOrderB2bMetadata({
      ...enrichment,
      status: "partial",
      companyAccountId: null,
    });
    const next = incrementB2bKitchenOrderStats(null, metadata);
    expect(next.promoted).toBe(1);
    expect(next.partial).toBe(1);
    expect(next.missingCompanyLink).toBe(1);
  });
});
