import Link from "next/link";
import { AlertTriangle, BarChart3, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITIES,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_EYEBROW,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_HEADLINE,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_OPERATOR_LINKS,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_SUBLINE,
} from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-content";
import {
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_AVT_ROUTE,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_TEST_IDS,
} from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-policy";
import type { ActualVsTheoreticalVarianceSnapshot } from "@/services/inventory/actual-vs-theoretical-variance-p2-102-service";

const CAPABILITY_ICONS = [BarChart3, TrendingUp, AlertTriangle] as const;

const TILE_STATUS_STYLES = {
  healthy: "border-emerald-300/60 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40",
  watch: "border-amber-300/60 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40",
  critical: "border-red-300/60 bg-red-50 dark:border-red-800 dark:bg-red-950/40",
} as const;

/** Blueprint P2-102 — actual vs theoretical variance dashboard tile panel. */
export function ActualVsTheoreticalVariancePanel({
  snapshot,
}: {
  snapshot: ActualVsTheoreticalVarianceSnapshot;
}) {
  const tile = snapshot.varianceTile;

  return (
    <div className="space-y-8" data-testid={ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live costing data"} · {tile.confidence}{" "}
          confidence · policy {snapshot.policyId}
        </p>
      </div>

      <Card
        className={`shadow-sm ${TILE_STATUS_STYLES[tile.status]}`}
        data-testid={ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_TEST_IDS[1]}
      >
        <CardHeader className="pb-2">
          <CardDescription>Dashboard variance tile</CardDescription>
          <CardTitle className="text-xl">{tile.headline}</CardTitle>
          <CardDescription className="text-sm">{tile.subline}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Drift</span>
            <p className="text-2xl font-semibold">{tile.driftPercent}%</p>
          </div>
          <div>
            <span className="text-muted-foreground">Alerts</span>
            <p className="text-2xl font-semibold">{tile.alertCount}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Theft signals</span>
            <p className="text-2xl font-semibold">{tile.theftAlertCount}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Total variance $</span>
            <p className="text-2xl font-semibold">${snapshot.totalVarianceCost.toFixed(2)}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="ml-auto self-end rounded-full">
            <Link href={ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_AVT_ROUTE}>Open full AVT report</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? BarChart3;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_TEST_IDS[index + 1]}
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

      {snapshot.theoreticalBaseline.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Theoretical baseline</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {snapshot.theoreticalBaseline.slice(0, 6).map((row) => (
              <Card key={row.productId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">{row.productName}</CardTitle>
                    <Badge variant={row.recipeCoverage ? "default" : "secondary"}>
                      {row.confidence}
                    </Badge>
                  </div>
                  <CardDescription>
                    ${row.theoreticalCostPerUnit.toFixed(2)}/unit · {row.soldQuantity} sold · $
                    {row.theoreticalUsage.toFixed(2)} theoretical
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {snapshot.actualDepletion.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Actual depletion variance</h3>
          <div className="grid gap-2">
            {snapshot.actualDepletion.slice(0, 6).map((row) => (
              <Card key={row.productId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">{row.productName}</CardTitle>
                    <Badge
                      variant={
                        row.severity === "critical"
                          ? "destructive"
                          : row.severity === "high"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {row.variancePercent}%
                    </Badge>
                  </div>
                  <CardDescription>
                    ${row.theoreticalCost.toFixed(2)} → ${row.actualCost.toFixed(2)} · {row.source}
                  </CardDescription>
                  <CardContent className="px-0 pt-2 text-xs text-muted-foreground">
                    {row.recommendation}
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
