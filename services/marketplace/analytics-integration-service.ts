import { startOfMonth, subMonths } from "date-fns";

import { marketplaceAnalyticsFromSettingsCenter } from "@/lib/marketplace/analytics-preferences";
import {
  buildFoodCostBreakdown,
  buildProcurementPnLLines,
  buildSavingsItems,
  MARKETPLACE_FOOD_COGS_CATEGORY_SLUGS,
  resolveMarketplaceAnalyticsPeriod,
  round2,
  sumEstimatedSavings,
  type MarketplaceAnalyticsPeriod,
  type MarketplaceFoodCostWithMarketplace,
  type MarketplaceProcurementPnL,
  type MarketplaceSavingsReport,
} from "@/lib/marketplace/analytics-integration-types";
import { orderListWhereForOwnerAnd, costSnapshotListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

async function loadWorkspaceOwnerUserId(workspaceId: string): Promise<string | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerUserId: true },
  });
  return workspace?.ownerUserId ?? null;
}

async function loadMarketplaceSpend(input: {
  workspaceId: string;
  start: Date;
  end: Date;
}): Promise<{ totalUsd: number; orderCount: number }> {
  const [agg, orderCount] = await Promise.all([
    prisma.marketplacePurchaseOrder.aggregate({
      where: {
        workspaceId: input.workspaceId,
        createdAt: { gte: input.start, lte: input.end },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      _sum: { total: true },
    }),
    prisma.marketplacePurchaseOrder.count({
      where: {
        workspaceId: input.workspaceId,
        createdAt: { gte: input.start, lte: input.end },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
    }),
  ]);

  return {
    totalUsd: decimalToNumber(agg._sum.total),
    orderCount,
  };
}

async function loadRevenueUsd(userId: string, start: Date, end: Date): Promise<number> {
  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: start, lte: end },
    status: { not: "CANCELLED" },
  });
  const agg = await prisma.order.aggregate({
    where: orderWhere,
    _sum: { total: true },
  });
  return decimalToNumber(agg._sum.total);
}

async function loadInternalFoodCostUsd(userId: string, start: Date, end: Date): Promise<number> {
  const costWhere = await costSnapshotListWhereForOwner(userId);
  const agg = await prisma.costSnapshot.aggregate({
    where: { AND: [costWhere, { createdAt: { gte: start, lte: end } }] },
    _sum: { totalCost: true },
  });
  return decimalToNumber(agg._sum.totalCost);
}

async function loadCategorySpend(input: {
  workspaceId: string;
  start: Date;
  end: Date;
  categorySlugPrefix?: string;
}): Promise<Array<{ slug: string; name: string; spendUsd: number; orderCount: number }>> {
  const lines = await prisma.marketplacePOLineItem.findMany({
    where: {
      purchaseOrder: {
        workspaceId: input.workspaceId,
        createdAt: { gte: input.start, lte: input.end },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      ...(input.categorySlugPrefix
        ? { product: { category: { slug: { startsWith: input.categorySlugPrefix } } } }
        : {}),
    },
    select: {
      total: true,
      purchaseOrderId: true,
      product: { select: { category: { select: { slug: true, name: true } } } },
    },
  });

  const buckets = new Map<string, { name: string; spendUsd: number; orderIds: Set<string> }>();
  for (const line of lines) {
    const slug = line.product.category.slug;
    const bucket = buckets.get(slug) ?? {
      name: line.product.category.name,
      spendUsd: 0,
      orderIds: new Set<string>(),
    };
    bucket.spendUsd += decimalToNumber(line.total);
    bucket.orderIds.add(line.purchaseOrderId);
    buckets.set(slug, bucket);
  }

  return [...buckets.entries()]
    .map(([slug, bucket]) => ({
      slug,
      name: bucket.name,
      spendUsd: round2(bucket.spendUsd),
      orderCount: bucket.orderIds.size,
    }))
    .sort((a, b) => b.spendUsd - a.spendUsd);
}

async function loadMonthlyBudgetUsd(userId: string): Promise<number | null> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  return marketplaceAnalyticsFromSettingsCenter(kitchen?.settingsCenterJson).monthlyBudgetUsd;
}

export async function getProcurementPnL(input: {
  workspaceId: string;
  userId: string;
  period?: MarketplaceAnalyticsPeriod;
}): Promise<MarketplaceProcurementPnL | null> {
  const period = input.period ?? "month";
  const { start, end } = resolveMarketplaceAnalyticsPeriod(period);

  const [spend, categoryRows, revenueUsd, budgetUsd] = await Promise.all([
    loadMarketplaceSpend({ workspaceId: input.workspaceId, start, end }),
    loadCategorySpend({ workspaceId: input.workspaceId, start, end }),
    loadRevenueUsd(input.userId, start, end),
    loadMonthlyBudgetUsd(input.userId),
  ]);

  const lines = buildProcurementPnLLines(
    categoryRows.map((row) => ({
      key: row.slug,
      label: row.name,
      amountUsd: row.spendUsd,
      orderCount: row.orderCount,
    })),
    spend.totalUsd,
  );

  const budgetVarianceUsd =
    budgetUsd != null && period === "month" ? round2(budgetUsd - spend.totalUsd) : null;

  return {
    workspaceId: input.workspaceId,
    period,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    currency: "USD",
    totalSpendUsd: round2(spend.totalUsd),
    orderCount: spend.orderCount,
    revenueUsd: round2(revenueUsd),
    procurementPctOfRevenue:
      revenueUsd > 0 ? round2((spend.totalUsd / revenueUsd) * 1000) / 10 : null,
    budgetUsd: period === "month" ? budgetUsd : null,
    budgetVarianceUsd,
    lines,
  };
}

export async function getFoodCostWithMarketplace(input: {
  workspaceId: string;
  userId: string;
  period?: MarketplaceAnalyticsPeriod;
}): Promise<MarketplaceFoodCostWithMarketplace | null> {
  const period = input.period ?? "month";
  const { start, end } = resolveMarketplaceAnalyticsPeriod(period);

  const [internalFoodCostUsd, revenueUsd, categoryRows] = await Promise.all([
    loadInternalFoodCostUsd(input.userId, start, end),
    loadRevenueUsd(input.userId, start, end),
    loadCategorySpend({ workspaceId: input.workspaceId, start, end }),
  ]);

  const marketplaceFoodSpendUsd = categoryRows
    .filter((row) =>
      MARKETPLACE_FOOD_COGS_CATEGORY_SLUGS.some(
        (slug) => row.slug === slug || row.slug.startsWith(`${slug}-`),
      ),
    )
    .reduce((sum, row) => sum + row.spendUsd, 0);

  return {
    workspaceId: input.workspaceId,
    period,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    currency: "USD",
    breakdown: buildFoodCostBreakdown({
      internalFoodCostUsd,
      marketplaceFoodSpendUsd,
      revenueUsd,
    }),
    marketplaceCategories: categoryRows
      .filter((row) =>
        MARKETPLACE_FOOD_COGS_CATEGORY_SLUGS.some(
          (slug) => row.slug === slug || row.slug.startsWith(`${slug}-`),
        ),
      )
      .map((row) => ({ slug: row.slug, name: row.name, spendUsd: row.spendUsd })),
  };
}

export async function getSavingsReport(input: {
  workspaceId: string;
  userId: string;
  period?: MarketplaceAnalyticsPeriod;
}): Promise<MarketplaceSavingsReport | null> {
  const period = input.period ?? "month";
  const { start, end, previousStart, previousEnd } = resolveMarketplaceAnalyticsPeriod(period);

  const [currentSpend, previousSpend, budgetUsd, recentLines] = await Promise.all([
    loadMarketplaceSpend({ workspaceId: input.workspaceId, start, end }),
    loadMarketplaceSpend({ workspaceId: input.workspaceId, start: previousStart, end: previousEnd }),
    loadMonthlyBudgetUsd(input.userId),
    prisma.marketplacePOLineItem.findMany({
      where: {
        purchaseOrder: {
          workspaceId: input.workspaceId,
          status: { notIn: ["DRAFT", "CANCELLED"] },
          createdAt: { gte: subMonths(new Date(), 3) },
        },
      },
      orderBy: { purchaseOrder: { createdAt: "desc" } },
      take: 300,
      select: {
        productId: true,
        productName: true,
        sku: true,
        quantity: true,
        unitPrice: true,
        purchaseOrder: { select: { createdAt: true, currency: true } },
        product: { select: { slug: true, basePrice: true, status: true } },
      },
    }),
  ]);

  const monthStart = startOfMonth(new Date());
  const monthlyQtyByProduct = new Map<string, number>();
  for (const line of recentLines) {
    if (line.purchaseOrder.createdAt < monthStart) continue;
    monthlyQtyByProduct.set(
      line.productId,
      (monthlyQtyByProduct.get(line.productId) ?? 0) + line.quantity,
    );
  }

  const lastPaidByProduct = new Map<
    string,
    {
      productName: string;
      sku: string;
      slug: string;
      lastPaidUnitPrice: number;
      currentUnitPrice: number;
      monthlyOrderQty: number;
    }
  >();

  for (const line of recentLines) {
    if (line.product.status !== "ACTIVE") continue;
    if (lastPaidByProduct.has(line.productId)) continue;
    const lastPaidUnitPrice = decimalToNumber(line.unitPrice);
    const currentUnitPrice = decimalToNumber(line.product.basePrice);
    lastPaidByProduct.set(line.productId, {
      productName: line.productName,
      sku: line.sku,
      slug: line.product.slug,
      lastPaidUnitPrice,
      currentUnitPrice,
      monthlyOrderQty: monthlyQtyByProduct.get(line.productId) ?? 1,
    });
  }

  const items = buildSavingsItems({
    rows: [...lastPaidByProduct.entries()].map(([productId, row]) => ({ productId, ...row })),
  });
  const spendDeltaUsd = round2(currentSpend.totalUsd - previousSpend.totalUsd);
  const spendDeltaPercent =
    previousSpend.totalUsd > 0
      ? round2((spendDeltaUsd / previousSpend.totalUsd) * 1000) / 10
      : null;

  return {
    workspaceId: input.workspaceId,
    period,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    currency: "USD",
    spendThisPeriodUsd: round2(currentSpend.totalUsd),
    spendPreviousPeriodUsd: round2(previousSpend.totalUsd),
    spendDeltaUsd,
    spendDeltaPercent,
    budgetHeadroomUsd:
      budgetUsd != null && period === "month" ? round2(budgetUsd - currentSpend.totalUsd) : null,
    priceDropCount: items.length,
    totalEstimatedSavingsUsd: sumEstimatedSavings(items),
    items: items.slice(0, 12),
  };
}

export async function loadMarketplaceAnalyticsIntegrationSnapshot(input: {
  workspaceId: string;
  userId: string;
  period?: MarketplaceAnalyticsPeriod;
}) {
  const ownerUserId = (await loadWorkspaceOwnerUserId(input.workspaceId)) ?? input.userId;
  const [procurementPnL, foodCost, savings] = await Promise.all([
    getProcurementPnL({ ...input, userId: ownerUserId }),
    getFoodCostWithMarketplace({ ...input, userId: ownerUserId }),
    getSavingsReport({ ...input, userId: ownerUserId }),
  ]);

  return { procurementPnL, foodCost, savings };
}
