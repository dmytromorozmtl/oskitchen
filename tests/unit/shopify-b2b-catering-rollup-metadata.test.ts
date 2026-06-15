import { describe, expect, it } from "vitest";

import {
  appendCateringQuoteRollupToB2bMetadata,
  buildB2bRollupMarker,
  incrementB2bCateringRollupStats,
  isoWeekKey,
  readB2bCateringQuoteRollupLink,
} from "@/lib/integrations/shopify-b2b-catering-rollup-metadata";
import type { KitchenOrderB2bMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import { resolveB2bCateringRollupMinTotal } from "@/lib/commercial/shopify-market-b2b-catering-rollup";

const b2b: KitchenOrderB2bMetadata = {
  status: "complete",
  companyAccountId: "acc-1",
  osMarketId: "us",
  shopifyCompanyId: "gid://shopify/Company/1",
  shopifyLocationId: "gid://shopify/CompanyLocation/9",
  companyName: "Office Lunch Co",
  locationName: "HQ",
  orderNotesBadge: "B2B · Office Lunch Co",
  routingSummary: "company=1",
  enrichedAt: "2026-06-01T01:00:00.000Z",
  promotedAt: "2026-06-01T02:00:00.000Z",
  missingCompanyLink: false,
};

describe("shopify-b2b-catering-rollup-metadata", () => {
  it("builds stable ISO week keys", () => {
    expect(isoWeekKey(new Date("2026-06-01T12:00:00.000Z"))).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("builds rollup marker for quote lookup", () => {
    expect(buildB2bRollupMarker({ fulfillmentWeekKey: "2026-W22", companyAccountId: "acc-1" })).toBe(
      "[kitchenos-b2b-rollup week=2026-W22 company=acc-1]",
    );
  });

  it("reads and writes rollup link on order metadata", () => {
    const link = {
      quoteId: "quote-1",
      quoteNumber: "Q-2026-0001",
      action: "created" as const,
      rolledAt: "2026-06-01T03:00:00.000Z",
      fulfillmentWeekKey: "2026-W22",
      lineCount: 3,
    };
    const source = {
      provider: "shopify",
      channelImport: true,
      b2b: appendCateringQuoteRollupToB2bMetadata(b2b, link),
    };
    expect(readB2bCateringQuoteRollupLink(source)?.quoteNumber).toBe("Q-2026-0001");
  });

  it("increments rollup stats", () => {
    const next = incrementB2bCateringRollupStats(null, {
      quotesCreated: 1,
      linesRolled: 4,
    });
    expect(next.quotesCreated).toBe(1);
    expect(next.linesRolled).toBe(4);
  });

  it("resolves default rollup threshold", () => {
    expect(resolveB2bCateringRollupMinTotal(null)).toBe(300);
    expect(resolveB2bCateringRollupMinTotal(500)).toBe(500);
  });
});
