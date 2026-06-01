export type MarketplaceAnalyticsPeriod = "month" | "quarter" | "year";

export type MarketplaceProcurementPnLLine = {
  key: string;
  label: string;
  amountUsd: number;
  orderCount: number;
  sharePercent: number;
};

export type MarketplaceProcurementPnL = {
  workspaceId: string;
  period: MarketplaceAnalyticsPeriod;
  periodStart: string;
  periodEnd: string;
  currency: string;
  totalSpendUsd: number;
  orderCount: number;
  revenueUsd: number;
  procurementPctOfRevenue: number | null;
  budgetUsd: number | null;
  budgetVarianceUsd: number | null;
  lines: MarketplaceProcurementPnLLine[];
};

export type MarketplaceFoodCostBreakdown = {
  internalFoodCostUsd: number;
  marketplaceFoodSpendUsd: number;
  combinedFoodCostUsd: number;
  revenueUsd: number;
  internalFoodCostPct: number | null;
  marketplaceFoodSpendPct: number | null;
  combinedFoodCostPct: number | null;
  targetFoodCostPct: number;
  vsTargetPct: number | null;
};

export type MarketplaceFoodCostWithMarketplace = {
  workspaceId: string;
  period: MarketplaceAnalyticsPeriod;
  periodStart: string;
  periodEnd: string;
  currency: string;
  breakdown: MarketplaceFoodCostBreakdown;
  marketplaceCategories: Array<{ slug: string; name: string; spendUsd: number }>;
};

export type MarketplaceSavingsItem = {
  productId: string;
  productName: string;
  sku: string;
  slug: string;
  lastPaidUnitPrice: number;
  currentUnitPrice: number;
  dropPercent: number;
  estimatedMonthlySavingsUsd: number;
};

export type MarketplaceSavingsReport = {
  workspaceId: string;
  period: MarketplaceAnalyticsPeriod;
  periodStart: string;
  periodEnd: string;
  currency: string;
  spendThisPeriodUsd: number;
  spendPreviousPeriodUsd: number;
  spendDeltaUsd: number;
  spendDeltaPercent: number | null;
  budgetHeadroomUsd: number | null;
  priceDropCount: number;
  totalEstimatedSavingsUsd: number;
  items: MarketplaceSavingsItem[];
};

export const MARKETPLACE_FOOD_COGS_CATEGORY_SLUGS = [
  "dry-goods",
  "dry-goods-pantry",
  "dry-goods-baking",
] as const;

export const MARKETPLACE_PROCUREMENT_CATEGORY_SLUGS = [
  "packaging-disposables",
  "cleaning-sanitation",
  "kitchenware-tools",
  "equipment",
  "dry-goods",
  "services",
  "uniforms",
  "training",
] as const;

export function resolveMarketplaceAnalyticsPeriod(
  period: MarketplaceAnalyticsPeriod,
  now = new Date(),
): { start: Date; end: Date; previousStart: Date; previousEnd: Date } {
  if (period === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const previousStart = new Date(now.getFullYear() - 1, 0, 1);
    const previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    return { start, end, previousStart, previousEnd };
  }

  if (period === "quarter") {
    const quarter = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
    const prevQuarter = quarter === 0 ? 3 : quarter - 1;
    const prevYear = quarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const previousStart = new Date(prevYear, prevQuarter * 3, 1);
    const previousEnd = new Date(prevYear, prevQuarter * 3 + 3, 0, 23, 59, 59, 999);
    return { start, end, previousStart, previousEnd };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  return { start, end, previousStart, previousEnd };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function pctOfTotal(part: number, total: number): number {
  if (total <= 0) return 0;
  return round1((part / total) * 100);
}

export function pctOfRevenue(amount: number, revenue: number): number | null {
  if (revenue <= 0) return null;
  return round1((amount / revenue) * 100);
}

export function buildProcurementPnLLines(
  slices: Array<{ key: string; label: string; amountUsd: number; orderCount: number }>,
  totalSpendUsd: number,
): MarketplaceProcurementPnLLine[] {
  return slices
    .filter((slice) => slice.amountUsd > 0)
    .map((slice) => ({
      key: slice.key,
      label: slice.label,
      amountUsd: round2(slice.amountUsd),
      orderCount: slice.orderCount,
      sharePercent: pctOfTotal(slice.amountUsd, totalSpendUsd),
    }))
    .sort((a, b) => b.amountUsd - a.amountUsd);
}

export function buildFoodCostBreakdown(input: {
  internalFoodCostUsd: number;
  marketplaceFoodSpendUsd: number;
  revenueUsd: number;
  targetFoodCostPct?: number;
}): MarketplaceFoodCostBreakdown {
  const combinedFoodCostUsd = round2(input.internalFoodCostUsd + input.marketplaceFoodSpendUsd);
  const targetFoodCostPct = input.targetFoodCostPct ?? 30;
  const combinedFoodCostPct = pctOfRevenue(combinedFoodCostUsd, input.revenueUsd);

  return {
    internalFoodCostUsd: round2(input.internalFoodCostUsd),
    marketplaceFoodSpendUsd: round2(input.marketplaceFoodSpendUsd),
    combinedFoodCostUsd,
    revenueUsd: round2(input.revenueUsd),
    internalFoodCostPct: pctOfRevenue(input.internalFoodCostUsd, input.revenueUsd),
    marketplaceFoodSpendPct: pctOfRevenue(input.marketplaceFoodSpendUsd, input.revenueUsd),
    combinedFoodCostPct,
    targetFoodCostPct,
    vsTargetPct:
      combinedFoodCostPct == null ? null : round1(combinedFoodCostPct - targetFoodCostPct),
  };
}

export function buildSavingsItems(input: {
  rows: Array<{
    productId: string;
    productName: string;
    sku: string;
    slug: string;
    lastPaidUnitPrice: number;
    currentUnitPrice: number;
    monthlyOrderQty: number;
  }>;
  minDropPercent?: number;
}): MarketplaceSavingsItem[] {
  const minDrop = input.minDropPercent ?? 5;
  return input.rows
    .map((row) => {
      if (row.lastPaidUnitPrice <= 0 || row.currentUnitPrice >= row.lastPaidUnitPrice) return null;
      const dropPercent = round1(((row.lastPaidUnitPrice - row.currentUnitPrice) / row.lastPaidUnitPrice) * 100);
      if (dropPercent < minDrop) return null;
      const unitSavings = row.lastPaidUnitPrice - row.currentUnitPrice;
      return {
        productId: row.productId,
        productName: row.productName,
        sku: row.sku,
        slug: row.slug,
        lastPaidUnitPrice: round2(row.lastPaidUnitPrice),
        currentUnitPrice: round2(row.currentUnitPrice),
        dropPercent,
        estimatedMonthlySavingsUsd: round2(unitSavings * Math.max(1, row.monthlyOrderQty)),
      };
    })
    .filter((item): item is MarketplaceSavingsItem => item != null)
    .sort((a, b) => b.estimatedMonthlySavingsUsd - a.estimatedMonthlySavingsUsd);
}

export function sumEstimatedSavings(items: readonly MarketplaceSavingsItem[]): number {
  return round2(items.reduce((sum, item) => sum + item.estimatedMonthlySavingsUsd, 0));
}
