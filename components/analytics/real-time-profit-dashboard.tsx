"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { ContributionMarginChart } from "@/components/analytics/contribution-margin-chart";
import { ProfitGauge } from "@/components/analytics/profit-gauge";
import { ProfitItemMarginBars } from "@/components/analytics/profit-item-margin-bars";
import { ProfitMarginBreakdownBar } from "@/components/analytics/profit-margin-breakdown-bar";
import { WaterfallChart } from "@/components/analytics/waterfall-chart";
import { sortContributionMarginByDollars } from "@/lib/analytics/contribution-margin-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { RealTimeProfitSnapshot } from "@/services/analytics/real-time-profit-service";

export function RealTimeProfitDashboard({
  initial,
  currency = "USD",
}: {
  initial: RealTimeProfitSnapshot;
  currency?: string;
}) {
  const [data, setData] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/real-time-profit");
      if (res.ok) {
        const json = (await res.json()) as RealTimeProfitSnapshot;
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => void refresh(), data.refreshSeconds * 1000);
    return () => clearInterval(id);
  }, [refresh, data.refreshSeconds]);

  const profitPositive = data.profit >= 0;
  const maxBucket = Math.max(...data.hourlyBuckets.map((b) => Math.max(b.revenue, b.cost)), 1);

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-12" data-testid="real-time-profit-dashboard">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="rounded-full -ml-2" asChild>
          <Link href="/dashboard/today">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Today
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={loading}
          onClick={() => void refresh()}
        >
          <RefreshCw className={cn("mr-1 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Real-time profit
        </p>
        <p
          className={cn(
            "mt-2 text-5xl font-bold tabular-nums tracking-tight",
            profitPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
          )}
          data-testid="profit-total"
        >
          {profitPositive ? "+" : ""}
          {formatCurrency(data.profit, currency)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatCurrency(data.revenue, currency)} revenue · updated{" "}
          {new Date(data.updatedAtIso).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>

      <Card className="border-border/80">
        <CardContent className="pt-6">
          <ProfitGauge marginPercent={data.marginPercent} zone={data.marginZone} />
          <ProfitMarginBreakdownBar snapshot={data} currency={currency} className="mt-6" />
          <WaterfallChart snapshot={data} currency={currency} className="mt-6" />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> 55%+
            </div>
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> 40–54%
            </div>
            <div>
              <span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> &lt;40%
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Revenue vs cost (6h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-36 items-end justify-between gap-2" data-testid="profit-hourly-chart">
            {data.hourlyBuckets.map((b) => (
              <div key={b.hour} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-28 w-full items-end justify-center gap-0.5">
                  <div
                    className="w-2 rounded-t bg-emerald-500/80"
                    style={{ height: `${(b.revenue / maxBucket) * 100}%`, minHeight: b.revenue > 0 ? 4 : 0 }}
                    title={`Revenue ${b.revenue}`}
                  />
                  <div
                    className="w-2 rounded-t bg-rose-500/70"
                    style={{ height: `${(b.cost / maxBucket) * 100}%`, minHeight: b.cost > 0 ? 4 : 0 }}
                    title={`Cost ${b.cost}`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{b.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Revenue
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-rose-500" /> Cost
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">Food</p>
          <p className="font-semibold tabular-nums">{formatCurrency(data.foodCost, currency)}</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">Labor</p>
          <p className="font-semibold tabular-nums">{formatCurrency(data.laborCost, currency)}</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">Delivery</p>
          <p className="font-semibold tabular-nums">{formatCurrency(data.deliveryCost, currency)}</p>
        </div>
      </div>

      {data.alerts.length > 0 ? (
        <div className="space-y-2" data-testid="profit-alerts">
          <h2 className="text-sm font-semibold">Alerts</h2>
          {data.alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm",
                alert.severity === "critical" && "border-rose-500/40 bg-rose-500/10",
                alert.severity === "warning" && "border-amber-500/40 bg-amber-500/10",
                alert.severity === "info" && "border-sky-500/30 bg-sky-500/5",
              )}
            >
              <p className="font-medium">{alert.title}</p>
              <p className="mt-0.5 text-muted-foreground">{alert.message}</p>
            </div>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Contribution margin leaders</CardTitle>
        </CardHeader>
        <CardContent>
          <ContributionMarginChart
            items={sortContributionMarginByDollars(data.topItems)}
            title="Top contributors today"
            emptyLabel="No item sales yet today."
            currency={currency}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <ProfitItemMarginBars
              items={data.topItems}
              title="Top margin items"
              emptyLabel="No item sales yet today."
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <ProfitItemMarginBars
              items={data.bottomItems}
              title="Needs attention"
              emptyLabel="No low-margin items flagged."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
