import Link from "next/link";
import { ArrowRightLeft, LineChart, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITIES,
  VENDOR_PRICE_INTELLIGENCE_P2_100_EYEBROW,
  VENDOR_PRICE_INTELLIGENCE_P2_100_HEADLINE,
  VENDOR_PRICE_INTELLIGENCE_P2_100_OPERATOR_LINKS,
  VENDOR_PRICE_INTELLIGENCE_P2_100_SUBLINE,
} from "@/lib/inventory/vendor-price-intelligence-p2-100-content";
import { VENDOR_PRICE_INTELLIGENCE_P2_100_TEST_IDS } from "@/lib/inventory/vendor-price-intelligence-p2-100-policy";
import type { VendorPriceIntelligenceSnapshot } from "@/services/inventory/vendor-price-intelligence-p2-100-service";

const CAPABILITY_ICONS = [LineChart, ArrowRightLeft, TrendingDown] as const;

/** Blueprint P2-100 — vendor price intelligence panel. */
export function VendorPriceIntelligencePanel({
  snapshot,
}: {
  snapshot: VendorPriceIntelligenceSnapshot;
}) {
  return (
    <div className="space-y-8" data-testid={VENDOR_PRICE_INTELLIGENCE_P2_100_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {VENDOR_PRICE_INTELLIGENCE_P2_100_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {VENDOR_PRICE_INTELLIGENCE_P2_100_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {VENDOR_PRICE_INTELLIGENCE_P2_100_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live price data"} · potential savings $
          {snapshot.totalPotentialSavings.toFixed(2)} · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Price history points</CardDescription>
            <CardTitle className="text-2xl">{snapshot.priceHistoryCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Substitutions</CardDescription>
            <CardTitle className="text-2xl">{snapshot.substitutionCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Cheaper vendors</CardDescription>
            <CardTitle className="text-2xl">{snapshot.cheaperVendorCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {VENDOR_PRICE_INTELLIGENCE_P2_100_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? LineChart;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={VENDOR_PRICE_INTELLIGENCE_P2_100_TEST_IDS[index + 1]}
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

      {snapshot.cheaperVendors.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Cheaper vendor opportunities</h3>
          <div className="grid gap-2">
            {snapshot.cheaperVendors.slice(0, 5).map((row) => (
              <Card key={row.ingredientId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">{row.ingredientName}</CardTitle>
                    <Badge variant="secondary">Save ${row.savingsPerOrder.toFixed(2)}</Badge>
                  </div>
                  <CardDescription>
                    {row.currentSupplier} ${row.currentUnitPrice.toFixed(2)} → {row.cheaperSupplier}{" "}
                    ${row.cheaperUnitPrice.toFixed(2)} ({row.savingsPercent}%)
                  </CardDescription>
                  <CardContent className="px-0 pt-2 text-sm text-muted-foreground">
                    {row.recommendation}
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {snapshot.substitutions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Substitution suggestions</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {snapshot.substitutions.map((row) => (
              <Card key={row.substituteIngredientId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">
                    {row.ingredientName} → {row.substituteName}
                  </CardTitle>
                  <CardDescription>
                    {row.primarySupplier} → {row.substituteSupplier} · save {row.savingsPercent}%
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {VENDOR_PRICE_INTELLIGENCE_P2_100_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
