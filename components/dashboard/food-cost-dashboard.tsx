"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { foodCostWhatIfAction } from "@/actions/food-cost-analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  GAUGE_TONE_BG,
  GAUGE_TONE_CLASS,
  gaugeTone,
} from "@/lib/ai/food-cost-dashboard-builders";
import type { FoodCostDashboardPayload, IngredientPriceSeries } from "@/lib/ai/food-cost-dashboard-types";
import type { FoodCostItemAnalysis } from "@/lib/ai/food-cost-types";
import { cn } from "@/lib/utils";

type Props = FoodCostDashboardPayload;

function MiniSparkline({ points, width = 120, height = 32 }: { points: { date: string; price: number }[]; width?: number; height?: number }) {
  if (points.length < 2) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const values = points.map((p) => p.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2;
  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (width - pad * 2);
    const y = height - pad - ((p.price - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });
  const up = values[values.length - 1]! > values[0]!;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("inline-block", up ? "text-red-500" : "text-emerald-500")} width={width} height={height} aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={coords.join(" ")} />
    </svg>
  );
}

function FoodCostGauge({ value, target }: { value: number; target: number }) {
  const tone = gaugeTone(value, target, "lower-is-better");
  const pct = Math.min(100, (value / Math.max(target * 1.5, 1)) * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" className="stroke-muted" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            className={GAUGE_TONE_BG[tone]}
            strokeWidth="10"
            strokeDasharray={`${(pct / 100) * 327} 327`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-semibold", GAUGE_TONE_CLASS[tone])}>{value.toFixed(1)}%</span>
          <span className="text-[10px] text-muted-foreground">target {target}%</span>
        </div>
      </div>
    </div>
  );
}

function ItemDrillDown({ item }: { item: FoodCostItemAnalysis }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-2">
      <p className="font-medium">{item.recommendation}</p>
      {item.ingredientBreakdown.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pb-1">Ingredient</th>
              <th className="pb-1">Share</th>
              <th className="pb-1">Price</th>
              <th className="pb-1">Trend</th>
            </tr>
          </thead>
          <tbody>
            {item.ingredientBreakdown.slice(0, 6).map((ing) => (
              <tr key={ing.ingredientId}>
                <td className="py-0.5">{ing.name}</td>
                <td>{ing.shareOfRecipeCostPercent}%</td>
                <td>${ing.currentCostPerUnit.toFixed(2)}</td>
                <td className={ing.priceTrend === "up" ? "text-red-600" : ing.priceTrend === "down" ? "text-emerald-600" : ""}>
                  {ing.priceTrend === "up" ? "↑" : ing.priceTrend === "down" ? "↓" : "→"}
                  {ing.priceChangePercent != null ? ` ${ing.priceChangePercent}%` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted-foreground">No recipe breakdown — attach a recipe for ingredient drill-down.</p>
      )}
    </div>
  );
}

function IngredientTracker({ series }: { series: IngredientPriceSeries[] }) {
  if (series.length === 0) {
    return <p className="text-sm text-muted-foreground">No ingredient price history in the last 30 days.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {series.map((s) => (
        <div key={s.ingredientId} className="rounded-lg border p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-muted-foreground">
                ${s.currentPrice.toFixed(2)} / {s.unit}
                {s.changePercent != null ? (
                  <span className={s.changePercent > 0 ? " text-red-600" : " text-emerald-600"}>
                    {" "}
                    ({s.changePercent > 0 ? "+" : ""}
                    {s.changePercent}%)
                  </span>
                ) : null}
              </p>
            </div>
            <MiniSparkline points={s.points} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FoodCostDashboard({ analysis, alerts, trend30d, ingredientPriceSeries, waste }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [whatIfPrice, setWhatIfPrice] = useState("14");
  const [whatIfIngredient, setWhatIfIngredient] = useState("4.5");
  const [whatIfResult, setWhatIfResult] = useState<{ foodCostPercent: number; grossMarginPercent: number } | null>(null);
  const [pending, startTransition] = useTransition();

  const chartData = useMemo(
    () =>
      trend30d.map((p) => ({
        ...p,
        label: p.date.slice(5),
      })),
    [trend30d],
  );

  const selectedItem = analysis.itemAnalyses[0];

  function runWhatIf() {
    startTransition(async () => {
      try {
        const salePrice = Number(whatIfPrice);
        const ingredientCost = Number(whatIfIngredient);
        const labor = selectedItem?.laborCost ?? 1;
        const result = await foodCostWhatIfAction({
          salePrice,
          ingredientCost,
          laborCost: labor,
        });
        setWhatIfResult(result);
      } catch {
        toast.error("What-if calculation failed.");
      }
    });
  }

  function exportPdf() {
    window.print();
    toast.success("Use Save as PDF in the print dialog.");
  }

  const marginTone = gaugeTone(analysis.overallGrossMarginPercent, analysis.targetMarginPercent, "higher-is-better");

  return (
    <div className="space-y-6 print:space-y-4" data-testid="food-cost-dashboard" id="food-cost-report">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Food Cost AI</h1>
          <p className="text-muted-foreground max-w-2xl">
            AI-assisted food cost analysis — {analysis.itemsAnalyzed} items, confidence{" "}
            {Math.round(analysis.confidence * 100)}%. Updated{" "}
            {new Date(analysis.analyzedAt).toLocaleString()}.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={exportPdf}>
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Export PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overall food cost</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <FoodCostGauge value={analysis.overallFoodCostPercent} target={analysis.targetFoodCostPercent} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gross margin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("text-3xl font-semibold", GAUGE_TONE_CLASS[marginTone])}>
              {analysis.overallGrossMarginPercent.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Target {analysis.targetMarginPercent}%</p>
            <Progress
              className="mt-3 h-2"
              value={Math.min(100, (analysis.overallGrossMarginPercent / analysis.targetMarginPercent) * 100)}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Alerts</CardTitle>
            <CardDescription>Margin &amp; ingredient spikes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{alerts.length}</p>
            <p className="text-sm text-muted-foreground">
              {alerts.filter((a) => a.severity === "critical").length} critical
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Waste (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">${waste.totalCost.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">{waste.totalEvents} events logged</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Food cost trend (30 days)</CardTitle>
          <CardDescription>From cost snapshot history — avg food cost % and margin</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {chartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="foodCostPercent" name="Food cost %" stroke="hsl(var(--chart-1))" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="marginPercent" name="Margin %" stroke="hsl(var(--chart-2))" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              Run costing recalculation to build trend data — need at least 2 days of snapshots.
            </p>
          )}
        </CardContent>
      </Card>

      {alerts.length > 0 ? (
        <Card className="border-amber-300/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
              Active food cost alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 5).map((a) => (
              <div key={a.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{a.title}</span>
                  <Badge variant={a.severity === "critical" ? "destructive" : "secondary"}>{a.severity}</Badge>
                </div>
                <p className="text-muted-foreground text-xs mt-1">{a.description}</p>
                <p className="text-xs mt-1">Est. impact ${a.impact.toFixed(0)}/wk · {a.suggestedAction}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profitability by item</CardTitle>
          <CardDescription>Click a row to drill down into ingredient breakdown</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="p-3 w-8" />
                <th className="p-3 font-medium">Item</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Food cost</th>
                <th className="p-3 font-medium">Margin</th>
                <th className="p-3 font-medium">Gap</th>
              </tr>
            </thead>
            <tbody>
              {analysis.itemAnalyses.map((item) => {
                const open = expandedId === item.productId;
                const fcTone = gaugeTone(item.foodCostPercent, item.targetFoodCostPercent, "lower-is-better");
                return (
                  <Fragment key={item.productId}>
                    <tr
                      className="border-b cursor-pointer hover:bg-muted/30"
                      onClick={() => setExpandedId(open ? null : item.productId)}
                    >
                      <td className="p-3 text-muted-foreground">
                        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className="p-3 font-medium">{item.itemTitle}</td>
                      <td className="p-3">${item.salePrice.toFixed(2)}</td>
                      <td className={cn("p-3", GAUGE_TONE_CLASS[fcTone])}>{item.foodCostPercent}%</td>
                      <td className="p-3">{item.grossMarginPercent}%</td>
                      <td className="p-3">
                        {item.marginGapPercent > 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <TrendingDown className="h-3 w-3" aria-hidden />
                            {item.marginGapPercent}pts
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <TrendingUp className="h-3 w-3" aria-hidden />
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                    {open ? (
                      <tr>
                        <td colSpan={6} className="p-3 pt-0">
                          <ItemDrillDown item={item} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
              {analysis.itemAnalyses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No costing data — add recipes and run costing first.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingredient price tracker</CardTitle>
            <CardDescription>30-day sparklines for top movers</CardDescription>
          </CardHeader>
          <CardContent>
            <IngredientTracker series={ingredientPriceSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What-if calculator</CardTitle>
            <CardDescription>Adjust price and ingredient cost to preview margin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="wi-price">Sale price ($)</Label>
                <Input id="wi-price" type="number" step="0.01" value={whatIfPrice} onChange={(e) => setWhatIfPrice(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="wi-ing">Ingredient cost ($)</Label>
                <Input id="wi-ing" type="number" step="0.01" value={whatIfIngredient} onChange={(e) => setWhatIfIngredient(e.target.value)} />
              </div>
            </div>
            <Button type="button" size="sm" disabled={pending} onClick={runWhatIf}>
              Calculate
            </Button>
            {whatIfResult ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                <p>
                  Food cost: <strong>{whatIfResult.foodCostPercent}%</strong>
                </p>
                <p>
                  Gross margin: <strong>{whatIfResult.grossMarginPercent}%</strong>
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Waste tracking (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {waste.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No waste events logged in the last 30 days.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Ingredient</th>
                    <th className="pb-2 pr-4">Qty</th>
                    <th className="pb-2 pr-4">Reason</th>
                    <th className="pb-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {waste.events.slice(0, 15).map((e) => (
                    <tr key={e.id} className="border-b border-border/50">
                      <td className="py-2 pr-4">{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 pr-4">{e.ingredientName}</td>
                      <td className="py-2 pr-4">
                        {e.quantity} {e.unit}
                      </td>
                      <td className="py-2 pr-4">{e.reason}</td>
                      <td className="py-2">${e.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="text-base">AI recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {analysis.recommendations.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
