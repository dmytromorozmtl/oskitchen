"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRightLeft, LineChart, Sparkles } from "lucide-react";

import {
  applyPriceIntelligenceAutoSwitchAction,
  togglePriceIntelligenceAutoSwitchAction,
} from "@/actions/marketplace/price-intelligence";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { PriceIntelligenceSnapshot } from "@/lib/marketplace/price-intelligence-types";
import { formatCurrency } from "@/lib/utils";

type Props = {
  snapshot: PriceIntelligenceSnapshot;
  canAutoSwitch: boolean;
};

export function PriceIntelligencePanel({ snapshot, canAutoSwitch }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(snapshot.autoSwitch.enabled);

  function handleToggleAutoSwitch(checked: boolean) {
    setError(null);
    setAutoSwitchEnabled(checked);
    startTransition(async () => {
      const res = await togglePriceIntelligenceAutoSwitchAction(checked);
      if (!res.ok) {
        setAutoSwitchEnabled(!checked);
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleApplySwitch(recommendationId: string) {
    setError(null);
    startTransition(async () => {
      const res = await applyPriceIntelligenceAutoSwitchAction(recommendationId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/dashboard/marketplace/checkout");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6" data-testid="price-intelligence-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Switch opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.switchesAvailable}</p>
            <p className="text-xs text-muted-foreground">{snapshot.summary.itemsScanned} SKUs scanned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly savings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(snapshot.summary.totalMonthlySavingsUsd, "USD")}
            </p>
            <p className="text-xs text-muted-foreground">If all switches applied</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Auto-switch ready</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.autoSwitchReady}</p>
            <p className="text-xs text-muted-foreground">Meet savings threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cheapest spreads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.cheapestLeaders.length}</p>
            <p className="text-xs text-muted-foreground">Multi-vendor SKU clusters</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRightLeft className="h-5 w-5 text-primary" aria-hidden />
              Auto-switch policy
            </CardTitle>
            <CardDescription>
              When enabled, eligible cheapest-supplier switches can be applied to cart in one click.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={autoSwitchEnabled}
              disabled={pending || !canAutoSwitch}
              onCheckedChange={handleToggleAutoSwitch}
              aria-label="Enable auto-switch"
            />
            <span className="text-sm text-muted-foreground">Auto-switch</span>
          </div>
        </CardHeader>
        {error ? (
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        ) : null}
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            Cheapest supplier switches
          </CardTitle>
          <CardDescription>
            Based on your last 90 days of marketplace purchases — switch to the lowest verified vendor price.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshot.recommendations.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-sm text-muted-foreground">
              No switch opportunities yet. Place marketplace orders to unlock cheapest-supplier intelligence.
            </p>
          ) : (
            snapshot.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border/70 p-4"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">{rec.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {rec.currentVendorName} {formatCurrency(rec.currentUnitPrice, rec.currency)} →{" "}
                    <span className="text-foreground">{rec.cheapestVendorName}</span>{" "}
                    {formatCurrency(rec.cheapestUnitPrice, rec.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Save {rec.savingsPercent}% · ~{formatCurrency(rec.monthlySavingsUsd, rec.currency)}/mo
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {rec.autoSwitchEligible ? (
                    <Badge className="rounded-full">Auto-switch ready</Badge>
                  ) : null}
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href={rec.compareHref}>Compare</Link>
                  </Button>
                  {canAutoSwitch ? (
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full"
                      disabled={pending}
                      onClick={() => handleApplySwitch(rec.id)}
                    >
                      Switch supplier
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {snapshot.cheapestLeaders.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LineChart className="h-5 w-5 text-primary" aria-hidden />
              Cheapest supplier leaderboard
            </CardTitle>
            <CardDescription>SKUs with the widest verified price spread across marketplace vendors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.cheapestLeaders.map((leader) => (
              <div
                key={leader.productId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{leader.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {leader.vendorName} · {leader.offerCount} offers
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {formatCurrency(leader.unitPrice, leader.currency)}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{leader.spreadPercent}% spread</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
