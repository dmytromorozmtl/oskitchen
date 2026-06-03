"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import {
  applyDynamicPricingSuggestionAction,
  endDynamicPricingAbTestAction,
  startDynamicPricingAbTestAction,
  toggleDynamicPricingAction,
} from "@/actions/dynamic-pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { DynamicPricingDashboard } from "@/lib/ai/dynamic-pricing-types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function DynamicPricingPanel({ initial }: { initial: DynamicPricingDashboard }) {
  const [data, setData] = React.useState(initial);
  const [pending, setPending] = React.useState<string | null>(null);

  const onToggle = async (enabled: boolean) => {
    setPending("toggle");
    const res = await toggleDynamicPricingAction(enabled);
    setPending(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setData(res.data);
    toast.success(enabled ? "Dynamic pricing enabled" : "Dynamic pricing paused");
  };

  const onApply = async (productId: string, suggestedPrice: number) => {
    setPending(productId);
    const res = await applyDynamicPricingSuggestionAction({ productId, suggestedPrice });
    setPending(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setData(res.data.dashboard);
    toast.success(res.data.message);
  };

  const onAbTest = async (productId: string) => {
    setPending(`ab-${productId}`);
    const res = await startDynamicPricingAbTestAction(productId);
    setPending(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setData(res.data.dashboard);
    toast.success(res.data.message);
  };

  const onEndAb = async (testId: string) => {
    setPending(testId);
    const res = await endDynamicPricingAbTestAction(testId);
    setPending(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setData(res.data.dashboard);
    toast.success(res.data.message);
  };

  const currency = data.currency;

  return (
    <div className="space-y-6" data-testid="dynamic-pricing-panel">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI dynamic pricing
            </CardTitle>
            <CardDescription>
              Time-of-day, weather proxy, local events, and velocity — capped ±{12}% per item.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{data.enabled ? "On" : "Off"}</span>
            <Switch
              checked={data.enabled}
              disabled={pending === "toggle"}
              onCheckedChange={(v) => void onToggle(v)}
              data-testid="dynamic-pricing-toggle"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            {data.activeSignals.map((s) => (
              <Badge key={`${s.kind}-${s.label}`} variant="secondary">
                {s.label} ×{s.multiplier.toFixed(2)}
              </Badge>
            ))}
            <Badge variant="outline">Weather: {data.weather}</Badge>
            <Badge variant="outline">{data.timezone}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{data.honestyNote}</p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Items scanned</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{data.summary.itemsScanned}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Suggestions</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{data.summary.suggestionsCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg lift</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{data.summary.avgLiftPercent}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>A/B running</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{data.summary.runningExperiments}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {data.abTests.length > 0 ? (
        <div className="space-y-2" data-testid="dynamic-pricing-ab-tests">
          <h2 className="text-sm font-semibold">Active experiments</h2>
          {data.abTests.map((test) => (
            <Card key={test.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                <div>
                  <p className="font-medium">{test.productTitle}</p>
                  <p className="text-muted-foreground">
                    Control {formatCurrency(test.controlPrice, currency)} vs variant B{" "}
                    {formatCurrency(test.variantPrice, currency)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending === test.id}
                  onClick={() => void onEndAb(test.id)}
                >
                  End test
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Price suggestions</h2>
        {data.suggestions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No material adjustments right now. Add menu items and order history, then refresh.
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/products">Manage menu</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          data.suggestions.map((s) => (
            <Card key={s.productId} data-testid="dynamic-pricing-suggestion">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{s.title}</CardTitle>
                  <Badge variant="outline">{s.category}</Badge>
                  <Badge
                    variant={s.changePercent >= 0 ? "default" : "secondary"}
                    className="gap-0.5 tabular-nums"
                  >
                    {s.changePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {s.changePercent > 0 ? "+" : ""}
                    {s.changePercent}%
                  </Badge>
                  <Badge variant="outline">{s.confidence} confidence</Badge>
                </div>
                <CardDescription>{s.rationale}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span>
                    Current:{" "}
                    <strong className="tabular-nums">{formatCurrency(s.currentPrice, currency)}</strong>
                  </span>
                  <span>
                    Suggested:{" "}
                    <strong
                      className={cn(
                        "tabular-nums",
                        s.changePercent >= 0 ? "text-emerald-600" : "text-amber-600",
                      )}
                    >
                      {formatCurrency(s.suggestedPrice, currency)}
                    </strong>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.signals.map((sig) => (
                    <Badge key={`${sig.kind}-${sig.label}`} variant="secondary" className="text-xs">
                      {sig.label}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={!data.enabled || pending === s.productId}
                    onClick={() => void onApply(s.productId, s.suggestedPrice)}
                    data-testid="dynamic-pricing-apply"
                  >
                    Apply price
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending === `ab-${s.productId}`}
                    onClick={() => void onAbTest(s.productId)}
                    data-testid="dynamic-pricing-ab-start"
                  >
                    A/B test +5%
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Scanned {new Date(data.scannedAt).toLocaleString()} — signals refresh on each page load.
      </p>
    </div>
  );
}
