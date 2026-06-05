import { describe, expect, it } from "vitest";

import {
  buildEnterpriseBrandAlerts,
  buildEnterpriseBrandRanks,
  buildEnterpriseMultiBrandDashboard,
} from "@/lib/enterprise/multi-brand-builders";
import {
  ENTERPRISE_MULTI_BRAND_PATH,
  ENTERPRISE_MULTI_BRAND_POLICY_ID,
  ENTERPRISE_MULTI_BRAND_SERVICE,
} from "@/lib/enterprise/multi-brand-policy";

describe("enterprise multi-brand command center", () => {
  it("locks policy constants", () => {
    expect(ENTERPRISE_MULTI_BRAND_POLICY_ID).toBe("enterprise-multi-brand-v1");
    expect(ENTERPRISE_MULTI_BRAND_SERVICE).toBe("services/enterprise/multi-brand-service.ts");
    expect(ENTERPRISE_MULTI_BRAND_PATH).toBe("/dashboard/enterprise/multi-brand");
  });

  const sampleBrands = [
    {
      brandId: "b1",
      brandName: "Harbor Kitchen",
      totalOrders: 120,
      totalRevenue: 5400,
      avgOrderValue: 45,
      activeProducts: 24,
      thisMonthOrders: 30,
      thisMonthRevenue: 1400,
    },
    {
      brandId: "b2",
      brandName: "Night Owl Tacos",
      totalOrders: 80,
      totalRevenue: 3200,
      avgOrderValue: 40,
      activeProducts: 18,
      thisMonthOrders: 12,
      thisMonthRevenue: 480,
    },
    {
      brandId: "b3",
      brandName: "Green Bowl Co",
      totalOrders: 40,
      totalRevenue: 1600,
      avgOrderValue: 40,
      activeProducts: 12,
      thisMonthOrders: 0,
      thisMonthRevenue: 0,
    },
    {
      brandId: "b4",
      brandName: "Slice Lab",
      totalOrders: 25,
      totalRevenue: 800,
      avgOrderValue: 32,
      activeProducts: 8,
      thisMonthOrders: 5,
      thisMonthRevenue: 160,
    },
  ];

  it("assigns lanes A–D by revenue rank", () => {
    const ranks = buildEnterpriseBrandRanks(sampleBrands);
    expect(ranks[0]?.lane).toBe("A");
    expect(ranks[0]?.brandName).toBe("Harbor Kitchen");
    expect(ranks[1]?.lane).toBe("B");
    expect(ranks[2]?.lane).toBe("C");
    expect(ranks[3]?.lane).toBe("D");
    expect(ranks[0]?.revenueShare).toBeGreaterThan(45);
  });

  it("flags inactive brands with prior revenue", () => {
    const ranks = buildEnterpriseBrandRanks(sampleBrands);
    const alerts = buildEnterpriseBrandAlerts(ranks);
    expect(alerts.some((row) => row.brandName === "Green Bowl Co")).toBe(true);
  });

  it("assembles dashboard summary", () => {
    const dashboard = buildEnterpriseMultiBrandDashboard({
      workspaceId: "ws-1",
      brands: sampleBrands,
    });
    expect(dashboard.policyId).toBe(ENTERPRISE_MULTI_BRAND_POLICY_ID);
    expect(dashboard.summary.totalRevenue).toBe(11000);
    expect(dashboard.summary.topBrandName).toBe("Harbor Kitchen");
    expect(dashboard.brands).toHaveLength(4);
    expect(dashboard.basePath).toBe(ENTERPRISE_MULTI_BRAND_PATH);
  });
});
