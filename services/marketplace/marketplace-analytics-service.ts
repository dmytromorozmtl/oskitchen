import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";

import {
  budgetAlertLevel,
  budgetProgressPercent,
  marketplaceAnalyticsFromSettingsCenter,
  type MarketplaceAnalyticsSettings,
} from "@/lib/marketplace/analytics-preferences";
import {
  marketplacePrefsFromSettingsCenter,
  mergeMarketplacePrefsIntoSettingsCenter,
} from "@/lib/marketplace/vendor-preferences";
import { toCsv } from "@/lib/import-export/csv-format";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type MarketplaceSpendSlice = {
  label: string;
  value: number;
};

export type MarketplaceSpendTrendPoint = {
  label: string;
  spend: number;
  orders: number;
};

export type MarketplaceCostPerUnitRow = {
  productId: string;
  productName: string;
  sku: string;
  orderCount: number;
  latestUnitPrice: number;
  avgUnitPrice: number;
  priceChangePercent: number | null;
  currency: string;
};

export type MarketplaceInventoryInsight = {
  openReorderCount: number;
  reorderItems: Array<{ id: string; ingredientName: string; urgency: string }>;
  suggestedProducts: Array<{ id: string; name: string; slug: string; vendorName: string; basePrice: number }>;
};

export type MarketplaceAnalyticsModel = {
  currency: string;
  spendThisMonth: number;
  spendLastMonth: number;
  orderCountThisMonth: number;
  settings: MarketplaceAnalyticsSettings;
  budgetProgressPercent: number | null;
  budgetAlertLevel: ReturnType<typeof budgetAlertLevel>;
  spendByCategory: MarketplaceSpendSlice[];
  spendByVendor: MarketplaceSpendSlice[];
  spendTrend: MarketplaceSpendTrendPoint[];
  costPerUnit: MarketplaceCostPerUnitRow[];
  inventory: MarketplaceInventoryInsight;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

async function loadKitchenSettingsCenter(dataUserId: string) {
  return prisma.kitchenSettings.findUnique({
    where: { userId: dataUserId },
    select: { settingsCenterJson: true },
  });
}

export async function loadMarketplaceAnalyticsSettings(
  dataUserId: string,
): Promise<MarketplaceAnalyticsSettings> {
  const kitchen = await loadKitchenSettingsCenter(dataUserId);
  return marketplaceAnalyticsFromSettingsCenter(kitchen?.settingsCenterJson);
}

export async function saveMarketplaceAnalyticsSettings(
  dataUserId: string,
  settings: MarketplaceAnalyticsSettings,
): Promise<void> {
  const kitchen = await loadKitchenSettingsCenter(dataUserId);
  const existingMarketplace = marketplacePrefsFromSettingsCenter(kitchen?.settingsCenterJson);
  const merged = mergeMarketplacePrefsIntoSettingsCenter(kitchen?.settingsCenterJson, {
    ...existingMarketplace,
    ...(settings.monthlyBudgetUsd != null
      ? { monthlyBudgetUsd: settings.monthlyBudgetUsd }
      : { monthlyBudgetUsd: undefined }),
  });
  if (settings.monthlyBudgetUsd == null && isPlainObject(merged.marketplace)) {
    delete (merged.marketplace as Record<string, unknown>).monthlyBudgetUsd;
  }
  await prisma.kitchenSettings.update({
    where: { userId: dataUserId },
    data: { settingsCenterJson: merged as Prisma.InputJsonValue },
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function loadMarketplaceAnalytics(input: {
  workspaceId: string;
  dataUserId: string;
  userId: string;
}): Promise<MarketplaceAnalyticsModel> {
  const monthStart = startOfMonth(new Date());
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
  const trendStart = startOfMonth(subMonths(new Date(), 5));
  const costWindowStart = subMonths(new Date(), 3);

  const settings = await loadMarketplaceAnalyticsSettings(input.dataUserId);

  const [
    spendThisMonthAgg,
    spendLastMonthAgg,
    orderCountThisMonth,
    ordersForTrend,
    lineItemsByCategory,
    ordersByVendor,
    lineItemsForCost,
    reorderItems,
    suggestedProducts,
  ] = await Promise.all([
    prisma.marketplacePurchaseOrder.aggregate({
      where: {
        workspaceId: input.workspaceId,
        createdAt: { gte: monthStart },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      _sum: { total: true },
    }),
    prisma.marketplacePurchaseOrder.aggregate({
      where: {
        workspaceId: input.workspaceId,
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      _sum: { total: true },
    }),
    prisma.marketplacePurchaseOrder.count({
      where: {
        workspaceId: input.workspaceId,
        createdAt: { gte: monthStart },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
    }),
    prisma.marketplacePurchaseOrder.findMany({
      where: {
        workspaceId: input.workspaceId,
        createdAt: { gte: trendStart },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      select: { createdAt: true, total: true },
    }),
    prisma.marketplacePOLineItem.findMany({
      where: {
        purchaseOrder: {
          workspaceId: input.workspaceId,
          createdAt: { gte: monthStart },
          status: { notIn: ["DRAFT", "CANCELLED"] },
        },
      },
      select: {
        total: true,
        product: { select: { category: { select: { name: true } } } },
      },
    }),
    prisma.marketplacePurchaseOrder.groupBy({
      by: ["vendorId"],
      where: {
        workspaceId: input.workspaceId,
        createdAt: { gte: monthStart },
        status: { notIn: ["DRAFT", "CANCELLED"] },
      },
      _sum: { total: true },
    }),
    prisma.marketplacePOLineItem.findMany({
      where: {
        purchaseOrder: {
          workspaceId: input.workspaceId,
          createdAt: { gte: costWindowStart },
          status: { notIn: ["DRAFT", "CANCELLED"] },
        },
      },
      orderBy: { purchaseOrder: { createdAt: "desc" } },
      select: {
        productId: true,
        productName: true,
        sku: true,
        unitPrice: true,
        purchaseOrder: { select: { currency: true, createdAt: true } },
      },
    }),
    prisma.reorderQueueItem.findMany({
      where: {
        workspaceId: input.workspaceId,
        status: "OPEN",
      },
      orderBy: { requiredByDate: "asc" },
      take: 5,
      include: { ingredient: { select: { name: true } } },
    }),
    prisma.vendorProduct.findMany({
      where: {
        status: "ACTIVE",
        category: { slug: { in: ["packaging-disposables", "cleaning-sanitation", "dry-goods"] } },
      },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: { vendor: { select: { companyName: true } } },
    }),
  ]);

  const spendThisMonth = decimalToNumber(spendThisMonthAgg._sum.total);
  const spendLastMonth = decimalToNumber(spendLastMonthAgg._sum.total);

  const categoryTotals = new Map<string, number>();
  for (const line of lineItemsByCategory) {
    const label = line.product.category.name;
    categoryTotals.set(label, (categoryTotals.get(label) ?? 0) + decimalToNumber(line.total));
  }

  const vendorRows = await prisma.vendor.findMany({
    where: { id: { in: ordersByVendor.map((row) => row.vendorId) } },
    select: { id: true, companyName: true },
  });
  const vendorNameById = new Map(vendorRows.map((row) => [row.id, row.companyName]));

  const spendByCategory = [...categoryTotals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const spendByVendor = ordersByVendor
    .map((row) => ({
      label: vendorNameById.get(row.vendorId) ?? row.vendorId.slice(0, 8),
      value: decimalToNumber(row._sum.total),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const trendBuckets = new Map<string, { spend: number; orders: number }>();
  for (let i = 5; i >= 0; i -= 1) {
    const key = format(subMonths(new Date(), i), "yyyy-MM");
    trendBuckets.set(key, { spend: 0, orders: 0 });
  }
  for (const order of ordersForTrend) {
    const key = format(order.createdAt, "yyyy-MM");
    const bucket = trendBuckets.get(key);
    if (!bucket) continue;
    bucket.spend += decimalToNumber(order.total);
    bucket.orders += 1;
  }
  const spendTrend = [...trendBuckets.entries()].map(([key, bucket]) => ({
    label: format(new Date(`${key}-01T12:00:00`), "MMM yy"),
    spend: Math.round(bucket.spend * 100) / 100,
    orders: bucket.orders,
  }));

  const costMap = new Map<
    string,
    {
      productName: string;
      sku: string;
      currency: string;
      prices: number[];
      latestUnitPrice: number;
      orderCount: number;
    }
  >();
  for (const line of lineItemsForCost) {
    const price = decimalToNumber(line.unitPrice);
    const existing = costMap.get(line.productId);
    if (!existing) {
      costMap.set(line.productId, {
        productName: line.productName,
        sku: line.sku,
        currency: line.purchaseOrder.currency,
        prices: [price],
        latestUnitPrice: price,
        orderCount: 1,
      });
      continue;
    }
    existing.prices.push(price);
    existing.orderCount += 1;
  }

  const costPerUnit: MarketplaceCostPerUnitRow[] = [...costMap.entries()]
    .map(([productId, row]) => {
      const avgUnitPrice =
        row.prices.reduce((sum, value) => sum + value, 0) / row.prices.length;
      const oldest = row.prices[row.prices.length - 1] ?? row.latestUnitPrice;
      const priceChangePercent =
        oldest > 0
          ? Math.round(((row.latestUnitPrice - oldest) / oldest) * 1000) / 10
          : null;
      return {
        productId,
        productName: row.productName,
        sku: row.sku,
        orderCount: row.orderCount,
        latestUnitPrice: row.latestUnitPrice,
        avgUnitPrice: Math.round(avgUnitPrice * 100) / 100,
        priceChangePercent,
        currency: row.currency,
      };
    })
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 12);

  const openReorderCount = await prisma.reorderQueueItem.count({
    where: { workspaceId: input.workspaceId, status: "OPEN" },
  });

  return {
    currency: "USD",
    spendThisMonth,
    spendLastMonth,
    orderCountThisMonth,
    settings,
    budgetProgressPercent: budgetProgressPercent(spendThisMonth, settings.monthlyBudgetUsd),
    budgetAlertLevel: budgetAlertLevel(spendThisMonth, settings.monthlyBudgetUsd),
    spendByCategory,
    spendByVendor,
    spendTrend,
    costPerUnit,
    inventory: {
      openReorderCount,
      reorderItems: reorderItems.map((item) => ({
        id: item.id,
        ingredientName: item.ingredient.name,
        urgency: item.urgency,
      })),
      suggestedProducts: suggestedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        vendorName: product.vendor.companyName,
        basePrice: decimalToNumber(product.basePrice),
      })),
    },
  };
}

export function marketplaceAnalyticsToCsv(model: MarketplaceAnalyticsModel): string {
  const rows: (string | number)[][] = [
    ["Metric", "Value"],
    ["Spend this month", model.spendThisMonth],
    ["Spend last month", model.spendLastMonth],
    ["Orders this month", model.orderCountThisMonth],
    ["Budget USD", model.settings.monthlyBudgetUsd ?? ""],
    ["Budget used %", model.budgetProgressPercent ?? ""],
    [],
    ["Category", "Spend"],
    ...model.spendByCategory.map((row) => [row.label, row.value]),
    [],
    ["Vendor", "Spend"],
    ...model.spendByVendor.map((row) => [row.label, row.value]),
    [],
    ["Month", "Spend", "Orders"],
    ...model.spendTrend.map((row) => [row.label, row.spend, row.orders]),
    [],
    ["SKU", "Product", "Latest unit", "Avg unit", "Orders", "Change %"],
    ...model.costPerUnit.map((row) => [
      row.sku,
      row.productName,
      row.latestUnitPrice,
      row.avgUnitPrice,
      row.orderCount,
      row.priceChangePercent ?? "",
    ]),
  ];

  return rows.map((row) => row.join(",")).join("\n");
}

export function marketplaceAnalyticsToHtml(model: MarketplaceAnalyticsModel): string {
  const categoryRows = model.spendByCategory
    .map((row) => `<tr><td>${escapeHtml(row.label)}</td><td>${row.value.toFixed(2)}</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Marketplace analytics</title>
<style>body{font-family:system-ui,sans-serif;padding:2rem}table{border-collapse:collapse;width:100%;margin-top:1rem}th,td{border-bottom:1px solid #ddd;padding:.5rem;text-align:left}@media print{body{padding:0}}</style>
</head><body>
<h1>Marketplace procurement analytics</h1>
<p>Spend this month: ${model.currency} ${model.spendThisMonth.toFixed(2)} · Orders: ${model.orderCountThisMonth}</p>
${model.settings.monthlyBudgetUsd ? `<p>Budget: ${model.currency} ${model.settings.monthlyBudgetUsd.toFixed(2)} (${model.budgetProgressPercent ?? 0}% used)</p>` : ""}
<h2>Spend by category</h2>
<table><thead><tr><th>Category</th><th>Spend</th></tr></thead><tbody>${categoryRows}</tbody></table>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildMarketplaceAnalyticsExportCsv(model: MarketplaceAnalyticsModel): string {
  return toCsv(
    ["section", "label", "value", "extra"],
    [
      ["summary", "spend_this_month", model.spendThisMonth, model.currency],
      ["summary", "spend_last_month", model.spendLastMonth, model.currency],
      ["summary", "orders_this_month", model.orderCountThisMonth, ""],
      ["summary", "budget_usd", model.settings.monthlyBudgetUsd ?? "", ""],
      ...model.spendByCategory.map((row) => ["category", row.label, row.value, ""]),
      ...model.spendByVendor.map((row) => ["vendor", row.label, row.value, ""]),
      ...model.spendTrend.map((row) => ["trend", row.label, row.spend, String(row.orders)]),
      ...model.costPerUnit.map((row) => [
        "cost_per_unit",
        row.sku,
        row.latestUnitPrice,
        `${row.avgUnitPrice}|${row.orderCount}`,
      ]),
    ],
  );
}
