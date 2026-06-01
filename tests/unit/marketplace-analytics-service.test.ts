import { describe, expect, it } from "vitest";

import {
  budgetAlertLevel,
  budgetProgressPercent,
  parseMarketplaceAnalyticsSettings,
} from "@/lib/marketplace/analytics-preferences";
import { buildMarketplaceAnalyticsExportCsv } from "@/services/marketplace/marketplace-analytics-service";

describe("marketplace analytics preferences", () => {
  it("parses monthly budget from settings", () => {
    expect(parseMarketplaceAnalyticsSettings({ monthlyBudgetUsd: 5000 }).monthlyBudgetUsd).toBe(5000);
    expect(parseMarketplaceAnalyticsSettings({ monthlyBudgetUsd: "7500" }).monthlyBudgetUsd).toBe(7500);
  });

  it("computes budget alert thresholds", () => {
    expect(budgetAlertLevel(4000, 5000)).toBe("warning");
    expect(budgetAlertLevel(5000, 5000)).toBe("critical");
    expect(budgetAlertLevel(1000, 5000)).toBe("none");
  });

  it("computes budget progress percent", () => {
    expect(budgetProgressPercent(4250, 5000)).toBe(85);
  });
});

describe("marketplace analytics export", () => {
  it("builds CSV export rows", () => {
    const csv = buildMarketplaceAnalyticsExportCsv({
      currency: "USD",
      spendThisMonth: 1000,
      spendLastMonth: 800,
      orderCountThisMonth: 4,
      settings: { monthlyBudgetUsd: 5000 },
      budgetProgressPercent: 20,
      budgetAlertLevel: "none",
      spendByCategory: [{ label: "Packaging", value: 600 }],
      spendByVendor: [{ label: "Vendor A", value: 600 }],
      spendTrend: [{ label: "Jun 26", spend: 1000, orders: 4 }],
      costPerUnit: [],
      inventory: { openReorderCount: 0, reorderItems: [], suggestedProducts: [] },
    });
    expect(csv).toContain("spend_this_month");
    expect(csv).toContain("Packaging");
  });
});
