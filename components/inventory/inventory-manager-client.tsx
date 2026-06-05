"use client";

import Link from "next/link";
import { AlertTriangle, Package, ShieldAlert, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_INVENTORY_MANAGER_ROUTE } from "@/lib/ai/inventory-manager-policy";
import type { InventoryManagerSnapshot } from "@/lib/ai/inventory-manager-types";
import { cn } from "@/lib/utils";

const SEVERITY_VARIANT: Record<
  InventoryManagerSnapshot["wasteSignals"][number]["severity"],
  "destructive" | "default" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "default",
  normal: "secondary",
  low: "outline",
};

type Props = {
  snapshot: InventoryManagerSnapshot;
};

export function InventoryManagerClient({ snapshot }: Props) {
  return (
    <div className="space-y-6" data-testid="ai-inventory-manager-root">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Inventory Manager</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Waste, theft, and shrinkage signals from logged waste events, cost variance, and inventory
          counts. Confidence {Math.round(snapshot.summary.confidence * 100)}%.
        </p>
      </div>

      <Card data-testid="ai-inventory-manager-daily-brief">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily inventory brief</CardTitle>
          <CardDescription>{snapshot.dailyBrief.executiveSummary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-lg font-medium">{snapshot.dailyBrief.headline}</p>
          {snapshot.dailyBrief.bullets.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {snapshot.dailyBrief.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trash2 className="h-4 w-4 text-muted-foreground" aria-hidden />
              Waste (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">${snapshot.summary.totalWasteCost.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">{snapshot.wasteSignals.length} reason groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-amber-600" aria-hidden />
              Theft signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{snapshot.theftSignals.length}</p>
            <p className="text-sm text-muted-foreground">
              ${snapshot.summary.totalTheftExposure.toFixed(0)} est. exposure
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-muted-foreground" aria-hidden />
              Shrinkage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              ${Math.abs(snapshot.summary.totalShrinkageCost).toFixed(0)}
            </p>
            <p className="text-sm text-muted-foreground">{snapshot.shrinkageSignals.length} counts</p>
          </CardContent>
        </Card>
      </div>

      {snapshot.theftSignals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
              Theft detection
            </CardTitle>
            <CardDescription>Cost variance ≥20% with elevated theft score.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.theftSignals.slice(0, 8).map((signal) => (
              <div
                key={signal.productId}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{signal.productName}</p>
                  <p className="text-xs text-muted-foreground">{signal.recommendation}</p>
                </div>
                <Badge variant={SEVERITY_VARIANT[signal.severity]}>Score {signal.theftScore}</Badge>
              </div>
            ))}
            <Link href="/dashboard/costing/theft" className="text-sm text-primary hover:underline">
              Open theft detection →
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {snapshot.wasteSignals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Waste by reason</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.wasteSignals.map((signal) => (
              <div
                key={signal.reason}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm",
                  signal.reason === "THEFT" && "border-rose-300/60 bg-rose-50/40 dark:bg-rose-950/20",
                )}
              >
                <span className="font-medium">{signal.reason}</span>
                <span className="tabular-nums text-muted-foreground">
                  {signal.eventCount} events · ${signal.totalCost.toFixed(0)}
                </span>
              </div>
            ))}
            <Link href="/dashboard/inventory/waste" className="text-sm text-primary hover:underline">
              Log waste →
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {snapshot.shrinkageSignals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Count shrinkage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.shrinkageSignals.slice(0, 6).map((signal) => (
              <div
                key={signal.countId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <span>{new Date(signal.countDateIso).toLocaleDateString()}</span>
                <span className="tabular-nums text-rose-700">${Math.abs(signal.shrinkCost).toFixed(0)}</span>
              </div>
            ))}
            <Link href="/dashboard/inventory/counts" className="text-sm text-primary hover:underline">
              Inventory counts →
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <p className="sr-only">{AI_INVENTORY_MANAGER_ROUTE}</p>
    </div>
  );
}
