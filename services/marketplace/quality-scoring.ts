import { buildQualityScoringSnapshot, buildSupplierQualityScore } from "@/lib/marketplace/quality-scoring-builders";
import type {
  PendingSupplierReview,
  QualityScoringSnapshot,
  SupplierQualityScore,
} from "@/lib/marketplace/quality-scoring-types";
import { prisma } from "@/lib/prisma";

export type { QualityScoringSnapshot } from "@/lib/marketplace/quality-scoring-types";

function round1(value: number | null | undefined): number | null {
  if (value == null) return null;
  return Math.round(Number(value) * 10) / 10;
}

async function loadWorkspaceVendorIds(workspaceId: string): Promise<string[]> {
  const rows = await prisma.marketplacePurchaseOrder.groupBy({
    by: ["vendorId"],
    where: {
      workspaceId,
      status: { notIn: ["DRAFT", "CANCELLED"] },
    },
  });
  return rows.map((row) => row.vendorId);
}

async function loadReviewAggregates(vendorIds: string[], workspaceId?: string) {
  if (vendorIds.length === 0) return new Map<string, {
    overall: number | null;
    quality: number | null;
    accuracy: number | null;
    delivery: number | null;
    packaging: number | null;
    count: number;
  }>();

  const rows = await prisma.marketplaceVendorReview.groupBy({
    by: ["vendorId"],
    where: {
      vendorId: { in: vendorIds },
      ...(workspaceId ? { workspaceId } : { isPublic: true }),
    },
    _avg: {
      overall: true,
      qualityScore: true,
      accuracyScore: true,
      deliveryScore: true,
      packagingScore: true,
    },
    _count: { _all: true },
  });

  return new Map(
    rows.map((row) => [
      row.vendorId,
      {
        overall: round1(row._avg.overall),
        quality: round1(row._avg.qualityScore),
        accuracy: round1(row._avg.accuracyScore),
        delivery: round1(row._avg.deliveryScore),
        packaging: round1(row._avg.packagingScore),
        count: row._count._all,
      },
    ]),
  );
}

async function loadOrderCounts(workspaceId: string, vendorIds: string[]): Promise<Map<string, number>> {
  if (vendorIds.length === 0) return new Map();
  const rows = await prisma.marketplacePurchaseOrder.groupBy({
    by: ["vendorId"],
    where: {
      workspaceId,
      vendorId: { in: vendorIds },
      status: { notIn: ["DRAFT", "CANCELLED"] },
    },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.vendorId, row._count._all]));
}

async function buildSupplierScores(input: {
  workspaceId: string;
  vendorIds: string[];
  scope: "workspace" | "global";
}): Promise<SupplierQualityScore[]> {
  if (input.vendorIds.length === 0) return [];

  const [vendors, ratings, orderCounts] = await Promise.all([
    prisma.vendor.findMany({
      where: { id: { in: input.vendorIds }, status: "APPROVED" },
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
    loadReviewAggregates(
      input.vendorIds,
      input.scope === "workspace" ? input.workspaceId : undefined,
    ),
    input.scope === "workspace"
      ? loadOrderCounts(input.workspaceId, input.vendorIds)
      : Promise.resolve(new Map<string, number>()),
  ]);

  return vendors
    .map((vendor) => {
      const rating = ratings.get(vendor.id);
      const orderCount = orderCounts.get(vendor.id) ?? 0;
      return buildSupplierQualityScore({
        vendorId: vendor.id,
        vendorName: vendor.companyName,
        overall: rating?.overall ?? null,
        quality: rating?.quality ?? null,
        accuracy: rating?.accuracy ?? null,
        delivery: rating?.delivery ?? null,
        packaging: rating?.packaging ?? null,
        reviewCount: rating?.count ?? 0,
        orderCount,
      });
    })
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0) || b.reviewCount - a.reviewCount);
}

async function loadPendingReviews(workspaceId: string): Promise<PendingSupplierReview[]> {
  const orders = await prisma.marketplacePurchaseOrder.findMany({
    where: {
      workspaceId,
      status: { in: ["DELIVERED", "COMPLETED"] },
      review: null,
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: {
      id: true,
      poNumber: true,
      vendorId: true,
      updatedAt: true,
      vendor: { select: { companyName: true } },
    },
  });

  return orders.map((order) => ({
    purchaseOrderId: order.id,
    poNumber: order.poNumber,
    vendorId: order.vendorId,
    vendorName: order.vendor.companyName,
    deliveredAtIso: order.updatedAt.toISOString(),
    href: `/dashboard/marketplace/orders/${order.id}`,
  }));
}

export async function loadMarketplaceQualityScoringSnapshot(
  workspaceId: string,
): Promise<QualityScoringSnapshot> {
  const workspaceVendorIds = await loadWorkspaceVendorIds(workspaceId);

  const [workspaceSuppliers, globalTopVendors, pendingReviews] = await Promise.all([
    buildSupplierScores({
      workspaceId,
      vendorIds: workspaceVendorIds,
      scope: "workspace",
    }),
    prisma.marketplaceVendorReview
      .groupBy({
        by: ["vendorId"],
        _avg: { overall: true },
        _count: { _all: true },
        orderBy: { _avg: { overall: "desc" } },
      })
      .then(async (groups) => {
        const topIds = groups
          .filter((row) => row._count._all >= 2)
          .slice(0, 8)
          .map((row) => row.vendorId);
        return buildSupplierScores({
          workspaceId,
          vendorIds: topIds,
          scope: "global",
        });
      }),
    loadPendingReviews(workspaceId),
  ]);

  return buildQualityScoringSnapshot({
    workspaceId,
    workspaceSuppliers,
    topMarketplaceSuppliers: globalTopVendors,
    pendingReviews,
  });
}

export function computeCompositeQualityScore(scores: {
  quality: number;
  accuracy: number;
  delivery: number;
  packaging: number;
}): number {
  return Math.round(
    ((scores.quality + scores.accuracy + scores.delivery + scores.packaging) / 4) * 10,
  ) / 10;
}
