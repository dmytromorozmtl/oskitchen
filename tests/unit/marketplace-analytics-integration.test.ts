import { describe, expect, it } from "vitest";

import {
  buildFoodCostBreakdown,
  buildProcurementPnLLines,
  buildSavingsItems,
  pctOfRevenue,
  resolveMarketplaceAnalyticsPeriod,
  sumEstimatedSavings,
} from "@/lib/marketplace/analytics-integration-types";

describe("marketplace analytics integration types", () => {
  it("resolves month/quarter/year period windows", () => {
    const now = new Date("2026-06-15T12:00:00.000Z");
    const month = resolveMarketplaceAnalyticsPeriod("month", now);
    expect(month.start.getMonth()).toBe(5);
    expect(month.previousStart.getMonth()).toBe(4);

    const quarter = resolveMarketplaceAnalyticsPeriod("quarter", now);
    expect(quarter.start.getMonth()).toBe(3);
  });

  it("builds procurement PnL category lines with share percent", () => {
    const lines = buildProcurementPnLLines(
      [
        { key: "dry-goods", label: "Dry Goods", amountUsd: 600, orderCount: 3 },
        { key: "packaging-disposables", label: "Packaging", amountUsd: 400, orderCount: 2 },
      ],
      1000,
    );
    expect(lines[0]?.sharePercent).toBe(60);
    expect(lines).toHaveLength(2);
  });

  it("combines internal and marketplace food cost against revenue", () => {
    const breakdown = buildFoodCostBreakdown({
      internalFoodCostUsd: 12000,
      marketplaceFoodSpendUsd: 3000,
      revenueUsd: 50000,
    });
    expect(breakdown.combinedFoodCostUsd).toBe(15000);
    expect(breakdown.combinedFoodCostPct).toBe(30);
    expect(breakdown.vsTargetPct).toBe(0);
    expect(pctOfRevenue(15000, 50000)).toBe(30);
  });

  it("builds savings items from price drops and sums estimated savings", () => {
    const items = buildSavingsItems({
      rows: [
        {
          productId: "p1",
          productName: "Olive oil 5L",
          sku: "OO-5L",
          slug: "olive-oil-5l",
          lastPaidUnitPrice: 40,
          currentUnitPrice: 34,
          monthlyOrderQty: 4,
        },
      ],
    });
    expect(items).toHaveLength(1);
    expect(items[0]?.dropPercent).toBe(15);
    expect(sumEstimatedSavings(items)).toBe(24);
  });
});
