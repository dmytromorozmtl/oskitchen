import {
  buildMarketplaceCommissionModelDemoReport,
  buildMarketplaceCommissionModelReport,
  MARKETPLACE_LEAD_FEE_USD,
  type MarketplaceCommissionModelReport,
} from "@/lib/marketplace/marketplace-commission-model-p2-118-operations";
import { MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID } from "@/lib/marketplace/marketplace-commission-model-p2-118-policy";
import { isFeaturedPlacementActive } from "@/lib/marketplace/featured-placement-types";
import { loadAllFeaturedPlacements } from "@/services/marketplace/featured-service";
import { loadPlatformMarketplaceAnalytics } from "@/services/marketplace/platform-marketplace-analytics-service";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export type MarketplaceCommissionModelSnapshot = MarketplaceCommissionModelReport & {
  mode: "live" | "demo";
  analyzedAt: string;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

export async function loadMarketplaceCommissionModelSnapshot(_input: {
  workspaceId: string | null;
}): Promise<MarketplaceCommissionModelSnapshot> {
  try {
    const periodStart = subDays(new Date(), 30);

    const [analytics, featuredPlacements, transactionAgg, newBuyerLeads30d] = await Promise.all([
      loadPlatformMarketplaceAnalytics(),
      loadAllFeaturedPlacements(),
      prisma.vendorTransaction.aggregate({
        where: { createdAt: { gte: periodStart } },
        _sum: { commissionAmount: true },
        _count: { _all: true },
      }),
      prisma.marketplacePurchaseOrder.groupBy({
        by: ["workspaceId"],
        where: { createdAt: { gte: periodStart } },
        _count: { _all: true },
      }),
    ]);

    const activeFeaturedSlots = featuredPlacements.filter((placement) =>
      isFeaturedPlacementActive(placement),
    ).length;

    const newBuyers = newBuyerLeads30d.filter((row) => row._count._all === 1).length;
    const leadFeeRevenue30dUsd = newBuyers * MARKETPLACE_LEAD_FEE_USD;
    const transactionFeeRevenue30dUsd = decimalToNumber(transactionAgg._sum.commissionAmount);

    const report = buildMarketplaceCommissionModelReport({
      commissionRevenue30dUsd: analytics.commissionRevenue30d,
      featuredRevenue30dUsd: analytics.featuredPlacementRevenue30d,
      leadFeeRevenue30dUsd,
      transactionFeeRevenue30dUsd,
      activeFeaturedSlots,
      newBuyerLeads30d: newBuyers,
      transactionCount30d: transactionAgg._count._all,
    });

    return {
      ...report,
      policyId: MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID,
      mode: "live",
      analyzedAt: new Date().toISOString(),
    };
  } catch {
    // Fall through to demo fixture
  }

  const demo = buildMarketplaceCommissionModelDemoReport();

  return {
    ...demo,
    policyId: MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
