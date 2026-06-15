import Link from "next/link";
import { AlertTriangle, ClipboardList, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITIES,
  INVENTORY_VARIANCE_REPORT_P2_99_EYEBROW,
  INVENTORY_VARIANCE_REPORT_P2_99_HEADLINE,
  INVENTORY_VARIANCE_REPORT_P2_99_OPERATOR_LINKS,
  INVENTORY_VARIANCE_REPORT_P2_99_SUBLINE,
} from "@/lib/inventory/inventory-variance-report-p2-99-content";
import { INVENTORY_VARIANCE_REPORT_P2_99_TEST_IDS } from "@/lib/inventory/inventory-variance-report-p2-99-policy";
import type { InventoryVarianceReportSnapshot } from "@/services/inventory/inventory-variance-report-p2-99-service";

const CAPABILITY_ICONS = [ClipboardList, AlertTriangle, Trash2] as const;

/** Blueprint P2-99 — inventory variance report panel. */
export function InventoryVarianceReportPanel({
  snapshot,
}: {
  snapshot: InventoryVarianceReportSnapshot;
}) {
  return (
    <div className="space-y-8" data-testid={INVENTORY_VARIANCE_REPORT_P2_99_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {INVENTORY_VARIANCE_REPORT_P2_99_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {INVENTORY_VARIANCE_REPORT_P2_99_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {INVENTORY_VARIANCE_REPORT_P2_99_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live signals"} · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Variance cost</CardDescription>
            <CardTitle className="text-2xl">${Math.abs(snapshot.totalVarianceCost).toFixed(0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Theft exposure</CardDescription>
            <CardTitle className="text-2xl">${snapshot.totalTheftExposure.toFixed(0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Waste tracked</CardDescription>
            <CardTitle className="text-2xl">${snapshot.totalWasteCost.toFixed(0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? ClipboardList;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={INVENTORY_VARIANCE_REPORT_P2_99_TEST_IDS[index + 1]}
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

      {snapshot.expectedVsActual.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Expected vs actual</h3>
          <div className="grid gap-2">
            {snapshot.expectedVsActual.slice(0, 5).map((row) => (
              <Card key={row.ingredientId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">{row.ingredientName}</CardTitle>
                    <Badge variant={row.varianceCost < 0 ? "destructive" : "secondary"}>
                      {row.varianceQty > 0 ? "+" : ""}
                      {row.varianceQty} {row.unit} · ${row.varianceCost.toFixed(2)}
                    </Badge>
                  </div>
                  <CardDescription>
                    Expected {row.expectedQty} · Actual {row.actualQty} · {row.variancePercent}%
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {snapshot.wasteTracking.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Waste tracking</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {snapshot.wasteTracking.map((row) => (
              <Card key={row.reason} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">{row.reason}</CardTitle>
                  <CardDescription>
                    {row.eventCount} events · ${row.totalCost.toFixed(2)}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {INVENTORY_VARIANCE_REPORT_P2_99_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
