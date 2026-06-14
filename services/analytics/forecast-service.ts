import { movingAverage, type DailySeriesPoint } from "@/lib/analytics/forecasting";
import { defaultFilters } from "@/lib/analytics/filters";
import { decimalToNumber } from "@/lib/catering/quote-calculations";
import { prisma } from "@/lib/prisma";
import { orderContributesToRevenue, whereOrdersForOwnerAnd } from "@/lib/analytics/revenue-metrics";

export type RevenueForecast = {
  history: DailySeriesPoint[];
  forecast: DailySeriesPoint[];
  warning?: string;
  insufficientHistory: boolean;
};

export async function loadRevenueForecast(args: { userId: string; daysAhead?: number }): Promise<RevenueForecast> {
  const daysAhead = args.daysAhead ?? 14;
  // Pull last 90 days of orders to drive the moving average.
  const range = defaultFilters();
  const start = new Date(range.to);
  start.setDate(start.getDate() - 90);

  const orders = await prisma.order.findMany({
    where: await whereOrdersForOwnerAnd(args.userId, {
      createdAt: { gte: start, lte: range.to },
    }),
    select: { createdAt: true, total: true, status: true },
    orderBy: { createdAt: "asc" },
  });
  const series = new Map<string, number>();
  for (const o of orders) {
    if (!orderContributesToRevenue(o.status)) continue;
    const key = o.createdAt.toISOString().slice(0, 10);
    series.set(key, (series.get(key) ?? 0) + decimalToNumber(o.total));
  }
  // Densify
  const history: DailySeriesPoint[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(range.to);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    history.push({ date: key, value: Math.round((series.get(key) ?? 0) * 100) / 100 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const result = movingAverage(history, daysAhead);
  if (!result) {
    return { history, forecast: [], insufficientHistory: true };
  }
  return { history, forecast: result.forecast, warning: result.warning, insufficientHistory: false };
}
