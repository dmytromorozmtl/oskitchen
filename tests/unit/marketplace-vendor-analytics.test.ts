import { describe, expect, it } from "vitest";

import { buildVendorAnalyticsExportCsv } from "@/services/marketplace/vendor-analytics-service";
import type { VendorAnalyticsModel } from "@/services/marketplace/vendor-analytics-service";

const sample: VendorAnalyticsModel = {
  currency: "USD",
  revenue30d: 5000,
  orders30d: 12,
  avgOrderValue: 416.67,
  repeatBuyerRate: 33,
  avgRating: 4.6,
  salesTrend: [],
  conversionFunnel: [],
  productPerformance: [
    {
      id: "p1",
      name: "Gloves",
      sku: "GL-1",
      slug: "gloves",
      revenue: 1200,
      unitsSold: 40,
      orderCount: 8,
      conversionRate: 12,
      stockQty: 100,
      status: "ACTIVE",
    },
  ],
  customerSegments: [],
  marketplaceInsights: [],
  inventoryForecast: [],
};

describe("vendor analytics helpers", () => {
  it("exports csv with product rows", () => {
    const csv = buildVendorAnalyticsExportCsv(sample);
    expect(csv).toContain("revenue_30d,5000");
    expect(csv).toContain("GL-1");
  });
});
