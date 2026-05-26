import { Prisma } from "@prisma/client";

import { defaultFilters, type AnalyticsFilters } from "@/lib/analytics/filters";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { analyticsSnapshotListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { loadExecutiveOverview } from "@/services/analytics/analytics-service";

function dec(value: number | null | undefined): Prisma.Decimal {
  return new Prisma.Decimal((value ?? 0).toFixed(4));
}

function decMoney(value: number | null | undefined): Prisma.Decimal {
  return new Prisma.Decimal((value ?? 0).toFixed(2));
}

export type CreateSnapshotInput = {
  userId: string;
  filters?: AnalyticsFilters;
  periodType?: "DAILY" | "WEEKLY" | "MONTHLY";
};

export async function createAnalyticsSnapshot(input: CreateSnapshotInput) {
  const filters = input.filters ?? defaultFilters();
  const overview = await loadExecutiveOverview({ userId: input.userId }, filters);
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  const snapshot = await prisma.analyticsSnapshot.create({
    data: {
      userId: input.userId,
      workspaceId,
      snapshotDate: new Date(),
      periodType: input.periodType ?? "DAILY",
      rangeStart: filters.from,
      rangeEnd: filters.to,
      grossRevenue: decMoney(overview.grossRevenue),
      netRevenue: decMoney(overview.netRevenue),
      orderCount: overview.orderCount,
      averageOrderValue: decMoney(overview.aov),
      repeatRate: dec(overview.repeatRate),
      newCustomerCount: overview.newCustomerCount,
      activeCustomerCount: overview.activeCustomerCount,
      cancelledOrders: overview.cancelledOrderCount,
      lateOrders: overview.lateOrderCount,
      productionCompletionRate: dec(overview.productionCompletionRate),
      packingCompletionRate: dec(overview.packingCompletionRate),
      deliveryCompletionRate: dec(overview.deliveryCompletionRate),
      cateringRevenue: decMoney(overview.cateringRevenue),
      mealPlanRevenue: decMoney(overview.mealPlanRevenue),
      topChannel: overview.topChannel?.channel ?? null,
      topBrandId: overview.topBrand?.brandId ?? null,
      topLocationId: overview.topLocation?.locationId ?? null,
      payloadJson: JSON.parse(JSON.stringify(overview)) as Prisma.InputJsonValue,
    },
  });
  await prisma.analyticsEvent.create({
    data: {
      userId: input.userId,
      workspaceId,
      sourceType: "analytics_snapshot",
      sourceId: snapshot.id,
      eventType: "SNAPSHOT_GENERATED",
      metadataJson: { rangeStart: filters.from, rangeEnd: filters.to } as Prisma.InputJsonValue,
    },
  });
  return snapshot;
}

export async function listSnapshots(userId: string) {
  const where = await analyticsSnapshotListWhereForOwner(userId);
  return prisma.analyticsSnapshot.findMany({
    where,
    orderBy: { snapshotDate: "desc" },
    take: 30,
  });
}
