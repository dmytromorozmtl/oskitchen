"use client";

import Link from "next/link";
import { BarChart3, Layers, Store, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EnterpriseMultiBrandDashboard } from "@/lib/enterprise/multi-brand-types";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  dashboard: EnterpriseMultiBrandDashboard;
};

const LANE_COLORS: Record<string, string> = {
  A: "bg-violet-500",
  B: "bg-sky-500",
  C: "bg-emerald-500",
  D: "bg-amber-500",
  "E+": "bg-slate-400",
};

export function MultiBrandEnterprisePanel({ dashboard }: Props) {
  const { brands, summary, alerts, basePath } = dashboard;

  return (
    <div className="space-y-6" data-testid="enterprise-multi-brand-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <Layers className="h-8 w-8 text-primary" aria-hidden />
            Multi-Brand Command Center
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Brand lanes A–D with revenue share, order volume, and month-over-month activity across your
            virtual brand portfolio.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/brands/new">Add brand</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/enterprise/multi-location">Multi-location</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/brands/command-center">Legacy view</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(summary.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">{summary.totalOrders} lifetime orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(summary.monthRevenue)}</p>
            <p className="text-xs text-muted-foreground">{summary.monthOrders} orders MTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active lanes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {summary.activeBrandCount}/{brands.length}
            </p>
            <p className="text-xs text-muted-foreground">brands with orders this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top lane</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.topBrandName ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {summary.topBrandShare > 0 ? `${summary.topBrandShare.toFixed(0)}% revenue share` : "No revenue yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {alerts.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Portfolio alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm",
                    alert.severity === "warning" && "border-amber-300/60 bg-amber-50/40 dark:bg-amber-950/20",
                  )}
                >
                  {alert.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {brands.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No brands configured</CardTitle>
            <CardDescription>
              Create Brand A, B, C, and D lanes to compare revenue per virtual brand on one screen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/brands/new">Create first brand</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" aria-hidden />
                Revenue share by lane
              </CardTitle>
              <CardDescription>Portfolio mix — lanes A–D ranked by lifetime revenue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {brands.map((brand) => (
                <div key={brand.brandId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      Lane {brand.lane} · {brand.brandName}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{brand.revenueShare.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", LANE_COLORS[brand.lane] ?? "bg-primary")}
                      style={{ width: `${Math.max(brand.revenueShare, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {brands.map((brand) => (
              <Card key={brand.brandId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white",
                          LANE_COLORS[brand.lane] ?? "bg-primary",
                        )}
                      >
                        {brand.lane}
                      </span>
                      {brand.brandName}
                    </CardTitle>
                    <Badge variant={brand.status === "active" ? "default" : "secondary"}>
                      {brand.status === "active" ? (
                        <span className="inline-flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" aria-hidden />
                          Active
                        </span>
                      ) : (
                        "Inactive"
                      )}
                    </Badge>
                  </div>
                  <CardDescription>Rank #{brand.rank} · {brand.revenueShare.toFixed(0)}% of portfolio</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-lg font-semibold tabular-nums">{formatCurrency(brand.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="text-lg font-semibold tabular-nums">{brand.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">This month</p>
                    <p className="font-semibold tabular-nums">{formatCurrency(brand.thisMonthRevenue)}</p>
                    <p className="text-xs text-muted-foreground">{brand.monthRevenueShare.toFixed(0)}% MTD share</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Products</p>
                    <p className="font-semibold tabular-nums">{brand.activeProducts}</p>
                    <p className="text-xs text-muted-foreground">AOV {formatCurrency(brand.avgOrderValue)}</p>
                  </div>
                </CardContent>
                <div className="border-t px-6 py-3">
                  <Link
                    href={`/dashboard/brands/${brand.brandId}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Store className="h-3 w-3" aria-hidden />
                    View brand →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">{basePath}</p>
    </div>
  );
}
