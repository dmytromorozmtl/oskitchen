import { describe, expect, it } from "vitest";

import {
  buildPlatformMarketplaceAnalyticsExportCsv,
  type PlatformMarketplaceAnalyticsModel,
} from "@/services/marketplace/platform-marketplace-analytics-service";

const SAMPLE_MODEL: PlatformMarketplaceAnalyticsModel = {
  currency: "USD",
  gmv30d: 125000,
  gmvPrev30d: 98000,
  orders30d: 420,
  commissionRevenue30d: 6250,
  commissionRevenueAllTime: 48000,
  featuredPlacementRevenue30d: 0,
  gmvTrend: [
    { label: "Jan 2026", gmv: 80000, orders: 300 },
    { label: "Feb 2026", gmv: 95000, orders: 340 },
  ],
  revenueByCategory: [
    { label: "Dry Goods", value: 45000 },
    { label: "Packaging", value: 22000 },
  ],
  revenueByVendorTier: [
    { label: "FREE", value: 30000 },
    { label: "GROWTH", value: 70000 },
  ],
  vendorMetrics: { active: 12, new: 3, churned: 2, totalApproved: 18 },
  buyerMetrics: { active: 45, new: 8, repeat: 22, totalBuyers: 50 },
};

describe("platform marketplace analytics", () => {
  it("builds CSV export with summary and trend sections", () => {
    const csv = buildPlatformMarketplaceAnalyticsExportCsv(SAMPLE_MODEL);
    expect(csv).toContain("GMV (30d)");
    expect(csv).toContain("125000");
    expect(csv).toContain("Dry Goods");
    expect(csv).toContain("Jan 2026");
    expect(csv).toContain("FREE");
  });
});
