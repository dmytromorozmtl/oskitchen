"use client";

import Link from "next/link";
import { BarChart3, LineChart, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CorporateReportingDashboard } from "@/lib/enterprise/corporate-reporting-types";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  dashboard: CorporateReportingDashboard;
};

function formatPct(value: number | null): string {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function TrendBadge({ value }: { value: number | null }) {
  if (value == null) return <Badge variant="outline">—</Badge>;
  const positive = value >= 0;
  return (
    <Badge
      variant={positive ? "default" : "destructive"}
      className={cn("gap-1 rounded-full", positive && "bg-emerald-600 hover:bg-emerald-600")}
    >
      {positive ? <TrendingUp className="h-3 w-3" aria-hidden /> : <TrendingDown className="h-3 w-3" aria-hidden />}
      {formatPct(value)}
    </Badge>
  );
}

export function CorporateReportingPanel({ dashboard }: Props) {
  const { plLines, trends, periodComparison, forecast, summary, warnings } = dashboard;
  const maxTrend = Math.max(...trends.map((row) => row.revenue), 1);

  return (
    <div className="space-y-6" data-testid="corporate-reporting-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <BarChart3 className="h-8 w-8 text-primary" aria-hidden />
            Corporate reporting
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            CEO P&L, revenue trends, and 90-day forecasts — one executive view for board and
            leadership. Period: {dashboard.rangeLabel}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/executive">Executive overview</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/forecast/forecasting-2">Forecasting 2.0</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/analytics/suite">Analytics suite</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/enterprise/multi-location">Multi-location</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(summary.netRevenue)}</p>
            <div className="mt-1 flex items-center gap-2">
              <TrendBadge value={periodComparison.changePercent} />
              <span className="text-xs text-muted-foreground">vs prior period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gross profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(summary.grossProfit)}</p>
            <p className="text-xs text-muted-foreground">
              Margin {summary.grossMarginPercent != null ? `${summary.grossMarginPercent}%` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">EBITDA (proxy)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(summary.ebitdaProxy)}</p>
            <p className="text-xs text-muted-foreground">
              Labor {summary.laborPercent.toFixed(1)}% · Food {summary.foodCostPercent.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">90-day forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(forecast.projectedRevenueUsd)}
            </p>
            <Badge variant="outline" className="mt-1 rounded-full capitalize text-xs">
              {forecast.confidence} confidence
            </Badge>
          </CardContent>
        </Card>
      </div>

      {warnings.length > 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Data notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChart className="h-4 w-4" aria-hidden />
              P&L statement
            </CardTitle>
            <CardDescription>CEO profit & loss for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm" data-testid="corporate-pl-table">
              <tbody>
                {plLines.map((line) => (
                  <tr
                    key={line.id}
                    className={cn(
                      "border-b border-border/50",
                      line.kind === "subtotal" && "font-medium",
                      line.kind === "total" && "font-semibold bg-muted/30",
                    )}
                  >
                    <td className={cn("py-2 pr-3", line.indent && "pl-4 text-muted-foreground")}>
                      {line.label}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {formatCurrency(line.amount)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">
                      {line.percentOfNetRevenue != null ? `${line.percentOfNetRevenue}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue trend</CardTitle>
            <CardDescription>
              Daily net revenue · {periodComparison.orderCount} orders (
              {formatPct(periodComparison.orderChangePercent)} vs prior)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex h-32 items-end gap-0.5"
              data-testid="corporate-revenue-trend"
              role="img"
              aria-label="Daily revenue trend chart"
            >
              {trends.length === 0 ? (
                <p className="text-sm text-muted-foreground">No revenue in this period.</p>
              ) : (
                trends.map((point) => (
                  <div
                    key={point.dateIso}
                    className="min-w-[3px] flex-1 rounded-t bg-primary/70"
                    style={{ height: `${Math.max(4, (point.revenue / maxTrend) * 100)}%` }}
                    title={`${point.dateIso}: ${formatCurrency(point.revenue)}`}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Forecast outlook</CardTitle>
          <CardDescription>
            Next {forecast.preview.length} days · {forecast.horizonDays}-day horizon ·{" "}
            {forecast.weatherUpliftDays} weather / {forecast.holidayUpliftDays} holiday uplift days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {forecast.preview.map((day) => (
              <div
                key={day.dateIso}
                className="rounded-lg border border-border/80 bg-muted/30 p-3"
                data-testid={`forecast-day-${day.dateIso}`}
              >
                <p className="text-xs font-medium text-muted-foreground">{day.dateIso}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {formatCurrency(day.revenueUsd)}
                </p>
                <p className="text-xs text-muted-foreground">{day.orders} orders</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Next 7 days projected {formatCurrency(forecast.nextSevenDaysRevenueUsd)} · Full horizon{" "}
            {forecast.projectedOrders.toLocaleString()} orders
          </p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Policy {dashboard.policyId} · Generated {new Date(dashboard.generatedAtIso).toLocaleString()}
      </p>
    </div>
  );
}
