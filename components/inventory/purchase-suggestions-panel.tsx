import Link from "next/link";
import { LineChart, Package, ShoppingCart, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PURCHASE_SUGGESTIONS_P2_98_CAPABILITIES,
  PURCHASE_SUGGESTIONS_P2_98_EYEBROW,
  PURCHASE_SUGGESTIONS_P2_98_HEADLINE,
  PURCHASE_SUGGESTIONS_P2_98_OPERATOR_LINKS,
  PURCHASE_SUGGESTIONS_P2_98_SUBLINE,
} from "@/lib/inventory/purchase-suggestions-p2-98-content";
import { PURCHASE_SUGGESTIONS_P2_98_TEST_IDS } from "@/lib/inventory/purchase-suggestions-p2-98-policy";
import type { PurchaseSuggestionsSnapshot } from "@/services/inventory/purchase-suggestions-p2-98-service";

const CAPABILITY_ICONS = [LineChart, Package, ShoppingCart, TrendingDown] as const;

const SIGNAL_LABELS: Record<string, string> = {
  forecast: "Forecast",
  low_stock: "Low stock",
  menu_demand: "Menu demand",
  vendor_price: "Vendor price",
};

/** Blueprint P2-98 — purchase suggestions panel. */
export function PurchaseSuggestionsPanel({ snapshot }: { snapshot: PurchaseSuggestionsSnapshot }) {
  return (
    <div className="space-y-8" data-testid={PURCHASE_SUGGESTIONS_P2_98_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {PURCHASE_SUGGESTIONS_P2_98_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{PURCHASE_SUGGESTIONS_P2_98_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {PURCHASE_SUGGESTIONS_P2_98_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live recommendations"} · {snapshot.itemCount}{" "}
          suggestion(s) · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Forecast signals</CardDescription>
            <CardTitle className="text-2xl">{snapshot.forecastCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Low stock</CardDescription>
            <CardTitle className="text-2xl">{snapshot.lowStockCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Menu demand</CardDescription>
            <CardTitle className="text-2xl">{snapshot.menuDemandCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Vendor price</CardDescription>
            <CardTitle className="text-2xl">{snapshot.vendorPriceCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PURCHASE_SUGGESTIONS_P2_98_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? LineChart;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={PURCHASE_SUGGESTIONS_P2_98_TEST_IDS[index + 1]}
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

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Suggested orders</h3>
          <p className="text-sm text-muted-foreground">
            Est. spend ${snapshot.estimatedSpend.toFixed(2)} · {snapshot.criticalCount} critical
          </p>
        </div>
        <div className="grid gap-3">
          {snapshot.items.map((item) => (
            <Card key={item.ingredientId} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{item.ingredientName}</CardTitle>
                    <CardDescription>
                      {item.orderQuantity} {item.unit} · ${item.estimatedTotal.toFixed(2)} ·{" "}
                      {item.supplierName}
                    </CardDescription>
                  </div>
                  <Badge variant={item.urgency === "critical" ? "destructive" : "secondary"}>
                    {item.urgency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {item.signals.map((signal) => (
                    <Badge key={signal.type} variant="outline" className="text-xs">
                      {SIGNAL_LABELS[signal.type] ?? signal.type}: {signal.label}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{item.suggestedAction}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PURCHASE_SUGGESTIONS_P2_98_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
