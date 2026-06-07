import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Forecasting2Snapshot } from "@/lib/ai/forecasting-types";
import { cn } from "@/lib/utils";

export function Forecasting2Panel({ snapshot }: { snapshot: Forecasting2Snapshot }) {
  const next30 = snapshot.dailyForecast.slice(0, 30);
  const confidenceLabel =
    snapshot.summary.confidence === "high"
      ? "High"
      : snapshot.summary.confidence === "medium"
        ? "Medium"
        : "Low";

  return (
    <div className="space-y-6" data-testid="forecasting-2-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">90-day orders</CardTitle>
            <p className="text-2xl font-semibold">{snapshot.summary.projectedTotalOrders.toLocaleString()}</p>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            ~{snapshot.summary.avgDailyOrders.toFixed(1)} orders/day baseline
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">90-day revenue</CardTitle>
            <p className="text-2xl font-semibold">
              ${snapshot.summary.projectedTotalRevenueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Weather + holiday adjusted</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weather adjustments</CardTitle>
            <p className="text-2xl font-semibold">{snapshot.summary.weatherUpliftDays}</p>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Days with weather proxy uplift</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Holiday uplift days</CardTitle>
            <p className="text-2xl font-semibold">{snapshot.summary.holidayUpliftDays}</p>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Confidence: {confidenceLabel}
          </CardContent>
        </Card>
      </div>

      {snapshot.summary.warning ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
          {snapshot.summary.warning}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming holidays</CardTitle>
          <CardDescription>Calendar windows applied to the {snapshot.horizonDays}-day horizon.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {snapshot.upcomingHolidays.length === 0 ? (
            <p className="text-muted-foreground">No holiday windows in the current horizon.</p>
          ) : (
            snapshot.upcomingHolidays.map((holiday) => (
              <div
                key={`${holiday.label}-${holiday.startIso}`}
                className="flex flex-wrap items-center justify-between gap-2 border-b pb-2"
              >
                <span className="font-medium">{holiday.label}</span>
                <span className="text-muted-foreground">
                  {holiday.startIso} → {holiday.endIso} · ×{holiday.boost.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next 30 days</CardTitle>
          <CardDescription>
            Daily baseline vs weather + holiday adjusted orders and revenue.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="px-2 py-2 font-medium text-right">Baseline orders</th>
                <th className="px-2 py-2 font-medium text-right">Adjusted orders</th>
                <th className="px-2 py-2 font-medium text-right">Revenue</th>
                <th className="px-2 py-2 font-medium">Weather</th>
                <th className="px-2 py-2 font-medium">Holiday</th>
              </tr>
            </thead>
            <tbody>
              {next30.map((point) => (
                <tr key={point.dateIso} className="border-b">
                  <td className="px-2 py-2 whitespace-nowrap">{point.dateIso}</td>
                  <td className="px-2 py-2 text-right">{point.baselineOrders}</td>
                  <td
                    className={cn(
                      "px-2 py-2 text-right font-medium",
                      point.adjustedOrders > point.baselineOrders && "text-primary",
                    )}
                  >
                    {point.adjustedOrders}
                  </td>
                  <td className="px-2 py-2 text-right">${point.adjustedRevenueUsd.toFixed(0)}</td>
                  <td className="px-2 py-2 text-xs text-muted-foreground">{point.weatherLabel}</td>
                  <td className="px-2 py-2 text-xs text-muted-foreground">{point.holidayLabel ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Policy {snapshot.policyId} · generated {snapshot.generatedAtIso.slice(0, 19).replace("T", " ")} UTC ·{" "}
        <Link href={snapshot.basePath} className="text-primary underline-offset-4 hover:underline">
          Forecast hub
        </Link>
      </p>
    </div>
  );
}
