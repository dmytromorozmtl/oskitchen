import { describe, expect, it } from "vitest";

import { buildPriceIntelligenceSnapshot } from "@/lib/marketplace/price-intelligence-builders";
import {
  PRICE_INTELLIGENCE_MIN_SAVINGS_PERCENT,
  PRICE_INTELLIGENCE_PATH,
  PRICE_INTELLIGENCE_POLICY_ID,
  PRICE_INTELLIGENCE_SERVICE,
} from "@/lib/marketplace/price-intelligence-policy";
import {
  DEFAULT_PRICE_INTELLIGENCE_AUTO_SWITCH,
  parsePriceIntelligenceAutoSwitch,
} from "@/lib/marketplace/price-intelligence-preferences";

describe("Price Intelligence", () => {
  it("locks policy constants", () => {
    expect(PRICE_INTELLIGENCE_POLICY_ID).toBe("price-intelligence-v1");
    expect(PRICE_INTELLIGENCE_SERVICE).toBe("services/marketplace/price-intelligence.ts");
    expect(PRICE_INTELLIGENCE_PATH).toBe("/dashboard/marketplace/price-intelligence");
    expect(PRICE_INTELLIGENCE_MIN_SAVINGS_PERCENT).toBe(5);
  });

  it("parses auto-switch preferences", () => {
    expect(parsePriceIntelligenceAutoSwitch(null)).toEqual(DEFAULT_PRICE_INTELLIGENCE_AUTO_SWITCH);
    expect(
      parsePriceIntelligenceAutoSwitch({ enabled: true, minSavingsPercent: 8 }),
    ).toEqual({ enabled: true, minSavingsPercent: 8 });
  });

  it("assembles price intelligence snapshot", () => {
    const snapshot = buildPriceIntelligenceSnapshot({
      workspaceId: "ws-1",
      autoSwitch: { enabled: true, minSavingsPercent: 5 },
      recommendations: [
        {
          id: "rec-1",
          productName: "Kraft box 12-pack",
          categoryLabel: "Packaging",
          currentProductId: "p1",
          currentProductSlug: "kraft-box-current",
          currentVendorId: "v1",
          currentVendorName: "PackCo",
          currentUnitPrice: 28,
          cheapestProductId: "p2",
          cheapestProductSlug: "kraft-box-cheap",
          cheapestVendorId: "v2",
          cheapestVendorName: "SupplyHub",
          cheapestUnitPrice: 22,
          currency: "USD",
          quantityLast90Days: 48,
          savingsPercent: 21.4,
          monthlySavingsUsd: 96,
          autoSwitchEligible: true,
          compareHref: "/dashboard/marketplace/compare?q=kraft",
        },
      ],
      cheapestLeaders: [
        {
          productId: "p2",
          productName: "Kraft box 12-pack",
          slug: "kraft-box-cheap",
          vendorName: "SupplyHub",
          unitPrice: 22,
          currency: "USD",
          spreadPercent: 21.4,
          offerCount: 3,
        },
      ],
      itemsScanned: 12,
    });

    expect(snapshot.policyId).toBe(PRICE_INTELLIGENCE_POLICY_ID);
    expect(snapshot.basePath).toBe(PRICE_INTELLIGENCE_PATH);
    expect(snapshot.summary.switchesAvailable).toBe(1);
    expect(snapshot.summary.autoSwitchReady).toBe(1);
    expect(snapshot.summary.totalMonthlySavingsUsd).toBe(96);
  });
});
