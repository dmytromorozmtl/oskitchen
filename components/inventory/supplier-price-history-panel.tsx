import Link from "next/link";
import { BarChart3, LineChart, TrendingUp } from "lucide-react";

import { SupplierPriceChart } from "@/components/purchasing/supplier-price-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITIES,
  SUPPLIER_PRICE_HISTORY_P2_103_EYEBROW,
  SUPPLIER_PRICE_HISTORY_P2_103_HEADLINE,
  SUPPLIER_PRICE_HISTORY_P2_103_OPERATOR_LINKS,
  SUPPLIER_PRICE_HISTORY_P2_103_SUBLINE,
} from "@/lib/inventory/supplier-price-history-p2-103-content";
import { SUPPLIER_PRICE_HISTORY_P2_103_TEST_IDS } from "@/lib/inventory/supplier-price-history-p2-103-policy";
import type { SupplierPriceHistorySnapshot } from "@/services/inventory/supplier-price-history-p2-103-service";

const CAPABILITY_ICONS = [LineChart, TrendingUp, BarChart3] as const;

const TREND_BADGE = {
  up: "destructive" as const,
  down: "default" as const,
  flat: "secondary" as const,
};

/** Blueprint P2-103 — supplier price history per ingredient graph panel. */
export function SupplierPriceHistoryPanel({ snapshot }: { snapshot: SupplierPriceHistorySnapshot }) {
  const featuredGraph = snapshot.ingredientGraphs[0];

  return (
    <div className="space-y-8" data-testid={SUPPLIER_PRICE_HISTORY_P2_103_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {SUPPLIER_PRICE_HISTORY_P2_103_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {SUPPLIER_PRICE_HISTORY_P2_103_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {SUPPLIER_PRICE_HISTORY_P2_103_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live price history"} ·{" "}
          {snapshot.totalDataPoints} data points · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Ingredient graphs</CardDescription>
            <CardTitle className="text-2xl">{snapshot.ingredientGraphCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Supplier trends</CardDescription>
            <CardTitle className="text-2xl">{snapshot.multiSupplierTrendCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Change summaries</CardDescription>
            <CardTitle className="text-2xl">{snapshot.priceChangeSummaryCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SUPPLIER_PRICE_HISTORY_P2_103_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? LineChart;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={SUPPLIER_PRICE_HISTORY_P2_103_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                  <CardDescription className="mt-1">{capability.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground">{capability.module}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {featuredGraph && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            Per-ingredient graph — {featuredGraph.ingredientName}
          </h3>
          <SupplierPriceChart
            data={featuredGraph.chartPoints.map((point) => ({
              date: point.date,
              price: point.price,
              supplierName: point.supplierName,
              ingredientName: featuredGraph.ingredientName,
              supplierItemId: featuredGraph.ingredientId,
            }))}
          />
        </div>
      )}

      {snapshot.multiSupplierTrends.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Multi-supplier trends</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {snapshot.multiSupplierTrends.slice(0, 6).map((row) => (
              <Card
                key={`${row.ingredientId}-${row.supplierName}`}
                className="border-border/80 shadow-sm"
              >
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">
                      {row.ingredientName} · {row.supplierName}
                    </CardTitle>
                    <Badge variant={TREND_BADGE[row.trend]}>
                      {row.changePercent > 0 ? "+" : ""}
                      {row.changePercent}%
                    </Badge>
                  </div>
                  <CardDescription>
                    ${row.earliestPrice.toFixed(2)} → ${row.latestPrice.toFixed(2)} ·{" "}
                    {row.dataPoints} point(s)
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {snapshot.priceChangeSummaries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Price change summary</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.priceChangeSummaries.slice(0, 6).map((row) => (
              <Card key={row.ingredientId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">{row.ingredientName}</CardTitle>
                  <CardDescription>
                    ${row.minPrice.toFixed(2)} – ${row.maxPrice.toFixed(2)} · latest $
                    {row.latestPrice.toFixed(2)}
                  </CardDescription>
                  <CardContent className="flex flex-wrap gap-2 px-0 pt-2">
                    <Badge variant={row.changePercent >= 5 ? "destructive" : "secondary"}>
                      {row.changePercent > 0 ? "+" : ""}
                      {row.changePercent}% change
                    </Badge>
                    <Badge variant="outline">{row.volatilityPercent}% volatility</Badge>
                    <Badge variant="outline">{row.supplierCount} supplier(s)</Badge>
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {SUPPLIER_PRICE_HISTORY_P2_103_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
