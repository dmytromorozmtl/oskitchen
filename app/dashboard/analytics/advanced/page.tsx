import Link from "next/link";

import { AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import { loadAdvancedReporting } from "@/services/analytics/advanced-reporting-service";

function formatChange(value: number | null): string {
  if (value == null) return "—";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value}%`;
}

function severityVariant(severity: "info" | "warning" | "critical"): "default" | "secondary" | "destructive" | "outline" {
  if (severity === "critical") return "destructive";
  if (severity === "warning") return "secondary";
  return "outline";
}

export default async function AdvancedReportingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, snapshot] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadAdvancedReporting({ userId: dataUserId }, filters),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Advanced reporting</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Benchmarks vs the prior period, deterministic revenue forecast, and rule-based anomaly detection.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/analytics/reports">Export reports</Link>
        </Button>
      </div>

      <AnalyticsFilterBar
        filters={filters}
        basePath="/dashboard/analytics/advanced"
        brands={brands}
        locations={locations}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {snapshot.benchmarks.map((metric) => (
          <Card key={metric.key} className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {metric.key === "cancellations"
                  ? `${Math.round(metric.current * 100)}%`
                  : metric.key === "orders"
                    ? metric.current
                    : formatCurrency(metric.current)}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Prior:{" "}
                {metric.key === "cancellations"
                  ? `${Math.round(metric.previous * 100)}%`
                  : metric.key === "orders"
                    ? metric.previous
                    : formatCurrency(metric.previous)}{" "}
                · {formatChange(metric.changePercent)}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">7-day revenue forecast</CardTitle>
            <CardDescription>
              Moving-average estimate · {snapshot.forecast.insufficientHistory ? "insufficient history" : formatCurrency(snapshot.forecast.next7DaysRevenue)} projected
            </CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.forecast.insufficientHistory ? (
              <p className="text-sm text-muted-foreground">
                Need at least 7 days of order history before forecasting.
              </p>
            ) : (
              <>
                {snapshot.forecast.warning ? (
                  <p className="mb-3 text-xs text-amber-700">{snapshot.forecast.warning}</p>
                ) : null}
                <AnalyticsDailyArea data={snapshot.forecast.daily} formatValue={formatCurrency} />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Anomaly detection</CardTitle>
            <CardDescription>
              Rule-based signals across revenue, operations, and analytics alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.anomalies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No anomalies detected in this window.</p>
            ) : (
              snapshot.anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="rounded-xl border border-border/70 px-3 py-2 text-sm"
                  data-testid="advanced-reporting-anomaly"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={severityVariant(anomaly.severity)} className="rounded-full text-[10px]">
                      {anomaly.severity}
                    </Badge>
                    <span className="font-medium capitalize">{anomaly.title}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{anomaly.detail}</p>
                  {anomaly.href ? (
                    <Link href={anomaly.href} className="mt-1 inline-block text-xs text-primary hover:underline">
                      Investigate
                    </Link>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Benchmark detail</CardTitle>
          <CardDescription>
            Current window {snapshot.rangeLabel} vs prior {snapshot.previousRangeLabel}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Metric</th>
                <th className="py-2 pr-3 font-medium">Current</th>
                <th className="py-2 pr-3 font-medium">Previous</th>
                <th className="py-2 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.benchmarks.map((metric) => (
                <tr key={metric.key} className="border-b border-border/40">
                  <td className="py-2 pr-3 font-medium">{metric.label}</td>
                  <td className="py-2 pr-3 tabular-nums">
                    {metric.key === "cancellations"
                      ? `${Math.round(metric.current * 100)}%`
                      : metric.key === "orders"
                        ? metric.current
                        : formatCurrency(metric.current)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">
                    {metric.key === "cancellations"
                      ? `${Math.round(metric.previous * 100)}%`
                      : metric.key === "orders"
                        ? metric.previous
                        : formatCurrency(metric.previous)}
                  </td>
                  <td className="py-2 tabular-nums">{formatChange(metric.changePercent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
