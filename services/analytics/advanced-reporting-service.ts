import type { OrderStatus } from "@prisma/client";

import type { AnalyticsFilters } from "@/lib/analytics/filters";
import { movingAverage, type DailySeriesPoint } from "@/lib/analytics/forecasting";
import { orderContributesToRevenue, whereOrdersInWindowForOwner } from "@/lib/analytics/revenue-metrics";
import { evaluateAnalyticsAlerts } from "@/services/analytics/alerts-service";
import { detectOperationalAnomalies } from "@/services/ai/anomaly-ai-service";

export type BenchmarkMetric = {
  key: string;
  label: string;
  current: number;
  previous: number;
  changePercent: number | null;
  direction: "up" | "down" | "flat";
};

export type ReportingAnomaly = {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  href?: string;
};

export type AdvancedReportingSnapshot = {
  rangeLabel: string;
  previousRangeLabel: string;
  benchmarks: BenchmarkMetric[];
  forecast: {
    next7DaysRevenue: number;
    daily: DailySeriesPoint[];
    warning?: string;
    insufficientHistory: boolean;
  };
  anomalies: ReportingAnomaly[];
};

type OrderRow = {
  status: OrderStatus;
  total: unknown;
  createdAt: Date;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatRangeLabel(from: Date, to: Date): string {
  return `${from.toISOString().slice(0, 10)} → ${to.toISOString().slice(0, 10)}`;
}

function previousWindow(from: Date, to: Date): { from: Date; to: Date } {
  const durationMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - durationMs);
  return { from: prevFrom, to: prevTo };
}

function summarizeOrders(orders: OrderRow[]) {
  let revenue = 0;
  let orderCount = 0;
  let cancelledCount = 0;
  for (const order of orders) {
    if (order.status === "CANCELLED") {
      cancelledCount += 1;
      continue;
    }
    if (!orderContributesToRevenue(order.status)) continue;
    orderCount += 1;
    revenue = round2(revenue + decimalToNumber(order.total));
  }
  const aov = orderCount > 0 ? round2(revenue / orderCount) : 0;
  const cancellationRate =
    orderCount + cancelledCount > 0
      ? round2(cancelledCount / (orderCount + cancelledCount))
      : 0;
  return { revenue, orderCount, aov, cancelledCount, cancellationRate };
}

function changePercent(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return round2(((current - previous) / previous) * 100);
}

function direction(current: number, previous: number): "up" | "down" | "flat" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
}

export function buildBenchmarkMetrics(input: {
  current: ReturnType<typeof summarizeOrders>;
  previous: ReturnType<typeof summarizeOrders>;
}): BenchmarkMetric[] {
  const defs = [
    { key: "revenue", label: "Revenue", current: input.current.revenue, previous: input.previous.revenue },
    { key: "orders", label: "Orders", current: input.current.orderCount, previous: input.previous.orderCount },
    { key: "aov", label: "Average order value", current: input.current.aov, previous: input.previous.aov },
    {
      key: "cancellations",
      label: "Cancellation rate",
      current: input.current.cancellationRate,
      previous: input.previous.cancellationRate,
    },
  ];
  return defs.map((def) => ({
    key: def.key,
    label: def.label,
    current: def.current,
    previous: def.previous,
    changePercent: changePercent(def.current, def.previous),
    direction: direction(def.current, def.previous),
  }));
}

export function detectReportingAnomalies(input: {
  benchmarks: BenchmarkMetric[];
  alertMessages: Array<{ severity: "info" | "warning" | "critical"; message: string; type: string }>;
  operational: Array<{ code: string; title: string; detail: string; href: string }>;
}): ReportingAnomaly[] {
  const anomalies: ReportingAnomaly[] = [];

  for (const benchmark of input.benchmarks) {
    if (benchmark.key === "revenue" && benchmark.changePercent != null) {
      if (benchmark.changePercent <= -30) {
        anomalies.push({
          id: "revenue_drop",
          severity: benchmark.changePercent <= -50 ? "critical" : "warning",
          title: "Revenue drop vs prior period",
          detail: `Revenue is down ${Math.abs(benchmark.changePercent)}% compared to the previous window.`,
        });
      } else if (benchmark.changePercent >= 40) {
        anomalies.push({
          id: "revenue_spike",
          severity: "info",
          title: "Revenue spike vs prior period",
          detail: `Revenue is up ${benchmark.changePercent}% compared to the previous window.`,
        });
      }
    }
    if (benchmark.key === "orders" && benchmark.changePercent != null && benchmark.changePercent <= -35) {
      anomalies.push({
        id: "order_volume_drop",
        severity: "warning",
        title: "Order volume drop",
        detail: `Orders fell ${Math.abs(benchmark.changePercent)}% vs the prior period.`,
      });
    }
    if (benchmark.key === "cancellations" && benchmark.current >= 0.15) {
      anomalies.push({
        id: "high_cancellations",
        severity: benchmark.current >= 0.25 ? "critical" : "warning",
        title: "High cancellation rate",
        detail: `${Math.round(benchmark.current * 100)}% of orders in the window were cancelled.`,
      });
    }
  }

  for (const alert of input.alertMessages) {
    anomalies.push({
      id: `alert_${alert.type}`,
      severity: alert.severity,
      title: alert.type.replaceAll("_", " ").toLowerCase(),
      detail: alert.message,
      href: "/dashboard/analytics",
    });
  }

  for (const flag of input.operational) {
    anomalies.push({
      id: `ops_${flag.code}`,
      severity: "warning",
      title: flag.title,
      detail: flag.detail,
      href: flag.href,
    });
  }

  return anomalies;
}

function buildDailyRevenueSeries(orders: OrderRow[], from: Date, to: Date): DailySeriesPoint[] {
  const map = new Map<string, number>();
  for (const order of orders) {
    if (!orderContributesToRevenue(order.status)) continue;
    const key = order.createdAt.toISOString().slice(0, 10);
    map.set(key, round2((map.get(key) ?? 0) + decimalToNumber(order.total)));
  }
  const series: DailySeriesPoint[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    series.push({ date: key, value: map.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
}

export function buildForecastSection(history: DailySeriesPoint[]): AdvancedReportingSnapshot["forecast"] {
  const result = movingAverage(history, 7);
  if (!result) {
    return { next7DaysRevenue: 0, daily: [], insufficientHistory: true };
  }
  const next7DaysRevenue = round2(result.forecast.reduce((sum, point) => sum + point.value, 0));
  return {
    next7DaysRevenue,
    daily: result.forecast,
    warning: result.warning,
    insufficientHistory: false,
  };
}

export async function loadAdvancedReporting(
  scope: { userId: string },
  filters: AnalyticsFilters,
): Promise<AdvancedReportingSnapshot> {
  const previous = previousWindow(filters.from, filters.to);
  const [currentWhere, previousWhere] = await Promise.all([
    whereOrdersInWindowForOwner({
      userId: scope.userId,
      from: filters.from,
      to: filters.to,
      brandId: filters.brandId,
      locationId: filters.locationId,
    }),
    whereOrdersInWindowForOwner({
      userId: scope.userId,
      from: previous.from,
      to: previous.to,
      brandId: filters.brandId,
      locationId: filters.locationId,
    }),
  ]);

  const lookbackStart = new Date(filters.to);
  lookbackStart.setDate(lookbackStart.getDate() - 90);

  const [currentOrders, previousOrders, historyOrders, alerts, operational] = await Promise.all([
    prisma.order.findMany({
      where: currentWhere,
      select: { status: true, total: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: previousWhere,
      select: { status: true, total: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: await whereOrdersInWindowForOwner({
        userId: scope.userId,
        from: lookbackStart,
        to: filters.to,
        brandId: filters.brandId,
        locationId: filters.locationId,
      }),
      select: { status: true, total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    evaluateAnalyticsAlerts(scope.userId),
    detectOperationalAnomalies(scope.userId),
  ]);

  const benchmarks = buildBenchmarkMetrics({
    current: summarizeOrders(currentOrders),
    previous: summarizeOrders(previousOrders),
  });
  const history = buildDailyRevenueSeries(historyOrders, lookbackStart, filters.to);
  const forecast = buildForecastSection(history);
  const anomalies = detectReportingAnomalies({
    benchmarks,
    alertMessages: alerts.filter((alert) => alert.triggered),
    operational,
  });

  return {
    rangeLabel: formatRangeLabel(filters.from, filters.to),
    previousRangeLabel: formatRangeLabel(previous.from, previous.to),
    benchmarks,
    forecast,
    anomalies,
  };
}
