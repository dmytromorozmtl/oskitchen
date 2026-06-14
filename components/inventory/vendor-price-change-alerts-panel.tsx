import Link from "next/link";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_INTELLIGENCE_ROUTE,
  VENDOR_PRICE_CHANGE_ALERTS_P2_67_MARGINEDGE_PARITY_NOTE,
} from "@/lib/inventory/vendor-price-change-alerts-p2-67-policy";
import type { VendorPriceChangeAlertsSnapshot } from "@/services/inventory/vendor-price-change-alerts-p2-67-service";

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

/** P2-67 — vendor price change alerts panel (MarginEdge parity). */
export function VendorPriceChangeAlertsPanel({
  snapshot,
}: {
  snapshot: VendorPriceChangeAlertsSnapshot;
}) {
  const { digest, alerts } = snapshot;

  return (
    <div className="space-y-6" data-testid="vendor-price-change-alerts">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {VENDOR_PRICE_CHANGE_ALERTS_P2_67_MARGINEDGE_PARITY_NOTE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live supplier price history"} · threshold{" "}
          {snapshot.thresholdPct}% · policy {snapshot.policyId}
        </p>
      </div>

      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="vendor-price-alert-summary"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total alerts</CardDescription>
            <CardTitle className="text-2xl">{digest.totalAlerts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Price increases</CardDescription>
            <CardTitle className="flex items-center gap-1 text-2xl text-rose-600">
              <TrendingUp className="h-5 w-5" aria-hidden />
              {digest.increaseCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Price decreases</CardDescription>
            <CardTitle className="flex items-center gap-1 text-2xl text-emerald-600">
              <TrendingDown className="h-5 w-5" aria-hidden />
              {digest.decreaseCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High severity</CardDescription>
            <CardTitle className="flex items-center gap-1 text-2xl">
              <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
              {digest.highSeverityCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {digest.suppliersAffected} supplier{digest.suppliersAffected === 1 ? "" : "s"} ·{" "}
          {digest.ingredientsAffected} ingredient{digest.ingredientsAffected === 1 ? "" : "s"} · avg
          change {digest.avgChangePercent}%
        </p>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={VENDOR_PRICE_CHANGE_ALERTS_P2_67_INTELLIGENCE_ROUTE}>
            Price intelligence →
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border" data-testid="vendor-price-alert-list">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Ingredient</th>
              <th className="px-3 py-2">Supplier</th>
              <th className="px-3 py-2">Previous</th>
              <th className="px-3 py-2">New</th>
              <th className="px-3 py-2">Change</th>
              <th className="px-3 py-2">Severity</th>
              <th className="px-3 py-2">Source</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                  No price changes above {snapshot.thresholdPct}% threshold in recent history.
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.alertId} className="border-t">
                  <td className="px-3 py-2">{alert.effectiveDate}</td>
                  <td className="px-3 py-2 font-medium">{alert.ingredientName}</td>
                  <td className="px-3 py-2">{alert.supplierName}</td>
                  <td className="px-3 py-2">${alert.previousPrice.toFixed(2)}</td>
                  <td className="px-3 py-2">${alert.newPrice.toFixed(2)}</td>
                  <td
                    className={
                      alert.alertType === "increase"
                        ? "px-3 py-2 text-rose-600"
                        : "px-3 py-2 text-emerald-600"
                    }
                  >
                    {alert.changePercent > 0 ? "+" : ""}
                    {alert.changePercent}%
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={SEVERITY_VARIANT[alert.severity] ?? "secondary"}>
                      {alert.severity}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{alert.source}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
