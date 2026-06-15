import {
  ENTERPRISE_BRAND_LANES,
  ENTERPRISE_MULTI_BRAND_PATH,
  ENTERPRISE_MULTI_BRAND_POLICY_ID,
} from "@/lib/enterprise/multi-brand-policy";
import type {
  EnterpriseBrandAlert,
  EnterpriseBrandLane,
  EnterpriseBrandRank,
  EnterpriseMultiBrandDashboard,
} from "@/lib/enterprise/multi-brand-types";
import type { BrandOverview } from "@/services/brand/brand-analytics";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function laneForRank(rank: number): EnterpriseBrandLane {
  if (rank >= 1 && rank <= ENTERPRISE_BRAND_LANES.length) {
    return ENTERPRISE_BRAND_LANES[rank - 1]!;
  }
  return "E+";
}

export function buildEnterpriseBrandRanks(brands: BrandOverview[]): EnterpriseBrandRank[] {
  const totalRevenue = brands.reduce((sum, row) => sum + row.totalRevenue, 0);
  const monthRevenue = brands.reduce((sum, row) => sum + row.thisMonthRevenue, 0);

  return [...brands]
    .sort((left, right) => right.totalRevenue - left.totalRevenue)
    .map((brand, index) => {
      const rank = index + 1;
      return {
        rank,
        lane: laneForRank(rank),
        brandId: brand.brandId,
        brandName: brand.brandName,
        totalRevenue: round2(brand.totalRevenue),
        thisMonthRevenue: round2(brand.thisMonthRevenue),
        thisMonthOrders: brand.thisMonthOrders,
        revenueShare: totalRevenue > 0 ? round2((brand.totalRevenue / totalRevenue) * 100) : 0,
        monthRevenueShare: monthRevenue > 0 ? round2((brand.thisMonthRevenue / monthRevenue) * 100) : 0,
        totalOrders: brand.totalOrders,
        avgOrderValue: round2(brand.avgOrderValue),
        activeProducts: brand.activeProducts,
        status: brand.thisMonthOrders > 0 ? "active" : "inactive",
      };
    });
}

export function buildEnterpriseBrandAlerts(ranks: EnterpriseBrandRank[]): EnterpriseBrandAlert[] {
  const alerts: EnterpriseBrandAlert[] = [];
  const top = ranks[0];

  if (top && top.revenueShare >= 80) {
    alerts.push({
      id: "concentration-risk",
      brandId: top.brandId,
      brandName: top.brandName,
      severity: "warning",
      message: `Lane ${top.lane} (${top.brandName}) is ${top.revenueShare.toFixed(0)}% of portfolio revenue — diversify virtual brands.`,
    });
  }

  for (const brand of ranks.filter((row) => row.status === "inactive" && row.totalRevenue > 0)) {
    alerts.push({
      id: `inactive-${brand.brandId}`,
      brandId: brand.brandId,
      brandName: brand.brandName,
      severity: "info",
      message: `Lane ${brand.lane} (${brand.brandName}) has no orders this month — review menu and channel sync.`,
    });
  }

  if (ranks.length === 0) {
    alerts.push({
      id: "no-brands",
      brandId: "none",
      brandName: "Portfolio",
      severity: "info",
      message: "Create Brand A–D lanes under Brands to unlock cross-brand revenue comparison.",
    });
  }

  return alerts;
}

export function buildEnterpriseMultiBrandDashboard(input: {
  workspaceId: string;
  brands: BrandOverview[];
  analyzedAt?: Date;
}): EnterpriseMultiBrandDashboard {
  const analyzedAt = input.analyzedAt ?? new Date();
  const ranks = buildEnterpriseBrandRanks(input.brands);
  const totalRevenue = round2(ranks.reduce((sum, row) => sum + row.totalRevenue, 0));
  const totalOrders = ranks.reduce((sum, row) => sum + row.totalOrders, 0);
  const monthRevenue = round2(ranks.reduce((sum, row) => sum + row.thisMonthRevenue, 0));
  const monthOrders = ranks.reduce((sum, row) => sum + row.thisMonthOrders, 0);
  const top = ranks[0] ?? null;

  return {
    policyId: ENTERPRISE_MULTI_BRAND_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: analyzedAt.toISOString(),
    brands: ranks,
    summary: {
      totalRevenue,
      totalOrders,
      monthRevenue,
      monthOrders,
      activeBrandCount: ranks.filter((row) => row.status === "active").length,
      topBrandName: top?.brandName ?? null,
      topBrandShare: top?.revenueShare ?? 0,
      avgOrderValue: totalOrders > 0 ? round2(totalRevenue / totalOrders) : 0,
    },
    alerts: buildEnterpriseBrandAlerts(ranks),
    basePath: ENTERPRISE_MULTI_BRAND_PATH,
  };
}
