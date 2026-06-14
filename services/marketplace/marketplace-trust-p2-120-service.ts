import {
  buildMarketplaceTrustDemoReport,
  buildMarketplaceTrustReport,
  type MarketplaceTrustReport,
} from "@/lib/marketplace/marketplace-trust-p2-120-operations";
import { MARKETPLACE_TRUST_P2_120_POLICY_ID } from "@/lib/marketplace/marketplace-trust-p2-120-policy";
import { countOpenPlatformDisputes } from "@/services/marketplace/platform-dispute-resolution-service";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export type MarketplaceTrustSnapshot = MarketplaceTrustReport & {
  mode: "live" | "demo";
  analyzedAt: string;
};

function round1(value: number | null | undefined): number | null {
  if (value == null) return null;
  return Math.round(Number(value) * 10) / 10;
}

export async function loadMarketplaceTrustSnapshot(input: {
  workspaceId: string | null;
}): Promise<MarketplaceTrustSnapshot> {
  try {
    if (input.workspaceId) {
      const periodStart = subDays(new Date(), 30);

      const vendorRows = await prisma.marketplacePurchaseOrder.groupBy({
        by: ["vendorId"],
        where: {
          workspaceId: input.workspaceId,
          status: { notIn: ["DRAFT", "CANCELLED"] },
        },
      });
      const vendorIds = vendorRows.map((row) => row.vendorId);

      const [
        vendors,
        reviewAgg,
        openDisputes,
        resolvedDisputes30d,
        fulfillmentAgg,
      ] = await Promise.all([
        vendorIds.length
          ? prisma.vendor.findMany({
              where: { id: { in: vendorIds } },
              select: { id: true, verifiedAt: true, status: true },
            })
          : Promise.resolve([]),
        vendorIds.length
          ? prisma.marketplaceVendorReview.aggregate({
              where: { vendorId: { in: vendorIds }, workspaceId: input.workspaceId },
              _avg: { overall: true, deliveryScore: true },
              _count: { _all: true },
            })
          : Promise.resolve({ _avg: { overall: null, deliveryScore: null }, _count: { _all: 0 } }),
        countOpenPlatformDisputes(),
        prisma.marketplaceDispute.count({
          where: {
            status: "RESOLVED",
            resolvedAt: { gte: periodStart },
            purchaseOrder: { workspaceId: input.workspaceId },
          },
        }),
        prisma.marketplacePurchaseOrder.groupBy({
          by: ["status"],
          where: {
            workspaceId: input.workspaceId,
            createdAt: { gte: periodStart },
            status: { notIn: ["DRAFT", "CANCELLED"] },
          },
          _count: { _all: true },
        }),
      ]);

      const verifiedVendorCount = vendors.filter(
        (vendor) => vendor.status === "APPROVED" && vendor.verifiedAt != null,
      ).length;

      const confirmedPlus = fulfillmentAgg
        .filter((row) =>
          ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"].includes(row.status),
        )
        .reduce((sum, row) => sum + row._count._all, 0);
      const completed = fulfillmentAgg
        .filter((row) => ["DELIVERED", "COMPLETED"].includes(row.status))
        .reduce((sum, row) => sum + row._count._all, 0);
      const onTimeFulfillmentPct =
        confirmedPlus > 0 ? Math.round((completed / confirmedPlus) * 100) : 0;

      const report = buildMarketplaceTrustReport({
        verifiedVendorCount,
        totalVendorCount: vendorIds.length,
        slaDeliveryScore: round1(reviewAgg._avg.deliveryScore),
        onTimeFulfillmentPct,
        reviewCount: reviewAgg._count._all,
        avgReviewScore: round1(reviewAgg._avg.overall),
        openDisputeCount: openDisputes,
        resolvedDisputeCount30d: resolvedDisputes30d,
      });

      return {
        ...report,
        policyId: MARKETPLACE_TRUST_P2_120_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const demo = buildMarketplaceTrustDemoReport();

  return {
    ...demo,
    policyId: MARKETPLACE_TRUST_P2_120_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
