/**
 * Pure helpers for supplier price history per ingredient graph (Blueprint P2-103).
 */

export type IngredientGraphSeries = {
  ingredientId: string;
  ingredientName: string;
  supplierCount: number;
  pointCount: number;
  chartPoints: Array<{
    date: string;
    price: number;
    supplierName: string;
  }>;
};

export type MultiSupplierTrendRow = {
  ingredientId: string;
  ingredientName: string;
  supplierName: string;
  latestPrice: number;
  earliestPrice: number;
  changePercent: number;
  dataPoints: number;
  trend: "up" | "down" | "flat";
};

export type PriceChangeSummaryRow = {
  ingredientId: string;
  ingredientName: string;
  minPrice: number;
  maxPrice: number;
  latestPrice: number;
  changePercent: number;
  volatilityPercent: number;
  supplierCount: number;
};

export type SupplierPriceHistoryReport = {
  ingredientGraphCount: number;
  multiSupplierTrendCount: number;
  priceChangeSummaryCount: number;
  totalDataPoints: number;
  ingredientGraphs: IngredientGraphSeries[];
  multiSupplierTrends: MultiSupplierTrendRow[];
  priceChangeSummaries: PriceChangeSummaryRow[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function computeChangePercent(earliest: number, latest: number): number {
  if (earliest <= 0) return 0;
  return round1(((latest - earliest) / earliest) * 100);
}

function trendFromChange(changePercent: number): MultiSupplierTrendRow["trend"] {
  if (changePercent >= 2) return "up";
  if (changePercent <= -2) return "down";
  return "flat";
}

export function buildIngredientGraphSeries(
  points: Array<{
    ingredientId: string;
    ingredientName: string;
    date: string;
    price: number;
    supplierName: string;
  }>,
): IngredientGraphSeries[] {
  const byIngredient = new Map<string, IngredientGraphSeries>();

  for (const point of points) {
    let series = byIngredient.get(point.ingredientId);
    if (!series) {
      series = {
        ingredientId: point.ingredientId,
        ingredientName: point.ingredientName,
        supplierCount: 0,
        pointCount: 0,
        chartPoints: [],
      };
      byIngredient.set(point.ingredientId, series);
    }
    series.chartPoints.push({
      date: point.date,
      price: round2(point.price),
      supplierName: point.supplierName,
    });
    series.pointCount += 1;
  }

  return [...byIngredient.values()]
    .map((series) => ({
      ...series,
      supplierCount: new Set(series.chartPoints.map((p) => p.supplierName)).size,
      chartPoints: [...series.chartPoints].sort(
        (a, b) => a.date.localeCompare(b.date) || a.supplierName.localeCompare(b.supplierName),
      ),
    }))
    .sort((a, b) => b.pointCount - a.pointCount);
}

export function buildMultiSupplierTrendRows(
  points: Array<{
    ingredientId: string;
    ingredientName: string;
    date: string;
    price: number;
    supplierName: string;
  }>,
): MultiSupplierTrendRow[] {
  const key = (ingredientId: string, supplierName: string) => `${ingredientId}:${supplierName}`;
  const grouped = new Map<
    string,
    { ingredientId: string; ingredientName: string; supplierName: string; prices: number[] }
  >();

  for (const point of points) {
    const k = key(point.ingredientId, point.supplierName);
    let row = grouped.get(k);
    if (!row) {
      row = {
        ingredientId: point.ingredientId,
        ingredientName: point.ingredientName,
        supplierName: point.supplierName,
        prices: [],
      };
      grouped.set(k, row);
    }
    row.prices.push(point.price);
  }

  return [...grouped.values()]
    .map((row) => {
      const earliestPrice = round2(row.prices[0]!);
      const latestPrice = round2(row.prices[row.prices.length - 1]!);
      const changePercent = computeChangePercent(earliestPrice, latestPrice);
      return {
        ingredientId: row.ingredientId,
        ingredientName: row.ingredientName,
        supplierName: row.supplierName,
        latestPrice,
        earliestPrice,
        changePercent,
        dataPoints: row.prices.length,
        trend: trendFromChange(changePercent),
      };
    })
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
}

export function buildPriceChangeSummaryRows(
  points: Array<{
    ingredientId: string;
    ingredientName: string;
    price: number;
    supplierName: string;
  }>,
): PriceChangeSummaryRow[] {
  const grouped = new Map<
    string,
    { ingredientId: string; ingredientName: string; prices: number[]; suppliers: Set<string> }
  >();

  for (const point of points) {
    let row = grouped.get(point.ingredientId);
    if (!row) {
      row = {
        ingredientId: point.ingredientId,
        ingredientName: point.ingredientName,
        prices: [],
        suppliers: new Set(),
      };
      grouped.set(point.ingredientId, row);
    }
    row.prices.push(point.price);
    row.suppliers.add(point.supplierName);
  }

  return [...grouped.values()]
    .map((row) => {
      const minPrice = round2(Math.min(...row.prices));
      const maxPrice = round2(Math.max(...row.prices));
      const latestPrice = round2(row.prices[row.prices.length - 1]!);
      const earliestPrice = round2(row.prices[0]!);
      const changePercent = computeChangePercent(earliestPrice, latestPrice);
      const volatilityPercent =
        minPrice > 0 ? round1(((maxPrice - minPrice) / minPrice) * 100) : 0;

      return {
        ingredientId: row.ingredientId,
        ingredientName: row.ingredientName,
        minPrice,
        maxPrice,
        latestPrice,
        changePercent,
        volatilityPercent,
        supplierCount: row.suppliers.size,
      };
    })
    .sort((a, b) => b.volatilityPercent - a.volatilityPercent);
}

export function buildSupplierPriceHistoryReport(input: {
  ingredientGraphs: IngredientGraphSeries[];
  multiSupplierTrends: MultiSupplierTrendRow[];
  priceChangeSummaries: PriceChangeSummaryRow[];
}): SupplierPriceHistoryReport {
  const totalDataPoints = input.ingredientGraphs.reduce((sum, g) => sum + g.pointCount, 0);

  return {
    ingredientGraphCount: input.ingredientGraphs.length,
    multiSupplierTrendCount: input.multiSupplierTrends.length,
    priceChangeSummaryCount: input.priceChangeSummaries.length,
    totalDataPoints,
    ingredientGraphs: input.ingredientGraphs,
    multiSupplierTrends: input.multiSupplierTrends,
    priceChangeSummaries: input.priceChangeSummaries,
  };
}

/** Demo fixture — deterministic supplier price history without DB. */
export const SUPPLIER_PRICE_HISTORY_DEMO_POINTS = [
  { ingredientId: "ing-chicken", ingredientName: "Chicken breast", date: "2026-01-15", price: 3.2, supplierName: "Sysco" },
  { ingredientId: "ing-chicken", ingredientName: "Chicken breast", date: "2026-02-01", price: 3.35, supplierName: "Sysco" },
  { ingredientId: "ing-chicken", ingredientName: "Chicken breast", date: "2026-03-01", price: 3.45, supplierName: "Sysco" },
  { ingredientId: "ing-chicken", ingredientName: "Chicken breast", date: "2026-02-01", price: 3.28, supplierName: "US Foods" },
  { ingredientId: "ing-chicken", ingredientName: "Chicken breast", date: "2026-03-01", price: 3.52, supplierName: "US Foods" },
  { ingredientId: "ing-oil", ingredientName: "Olive oil", date: "2026-01-20", price: 18.5, supplierName: "Restaurant Depot" },
  { ingredientId: "ing-oil", ingredientName: "Olive oil", date: "2026-02-15", price: 19.2, supplierName: "Restaurant Depot" },
  { ingredientId: "ing-oil", ingredientName: "Olive oil", date: "2026-03-10", price: 17.8, supplierName: "Restaurant Depot" },
  { ingredientId: "ing-flour", ingredientName: "All-purpose flour", date: "2026-02-01", price: 22.0, supplierName: "Sysco" },
  { ingredientId: "ing-flour", ingredientName: "All-purpose flour", date: "2026-03-01", price: 24.5, supplierName: "Sysco" },
  { ingredientId: "ing-flour", ingredientName: "All-purpose flour", date: "2026-02-01", price: 21.5, supplierName: "US Foods" },
  { ingredientId: "ing-flour", ingredientName: "All-purpose flour", date: "2026-03-01", price: 23.8, supplierName: "US Foods" },
] as const;

export function buildSupplierPriceHistoryDemoReport(): SupplierPriceHistoryReport {
  const points = [...SUPPLIER_PRICE_HISTORY_DEMO_POINTS];
  const ingredientGraphs = buildIngredientGraphSeries(points);
  const multiSupplierTrends = buildMultiSupplierTrendRows(points);
  const priceChangeSummaries = buildPriceChangeSummaryRows(points);

  return buildSupplierPriceHistoryReport({
    ingredientGraphs,
    multiSupplierTrends,
    priceChangeSummaries,
  });
}
