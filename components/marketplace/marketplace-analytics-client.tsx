"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle, Download, Package } from "lucide-react";

import { updateMarketplaceBudgetAction } from "@/actions/marketplace/analytics";
import {
  MarketplaceCostPerUnitTable,
  MarketplaceSpendBarChart,
  MarketplaceSpendDonutChart,
  MarketplaceSpendLineChart,
} from "@/components/marketplace/marketplace-analytics-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import type { MarketplaceAnalyticsModel } from "@/services/marketplace/marketplace-analytics-service";

export function MarketplaceAnalyticsClient({
  model,
  canManageBudget,
}: {
  model: MarketplaceAnalyticsModel;
  canManageBudget: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full">
          <a href="/api/marketplace/analytics/export?format=csv">
            <Download className="mr-2 h-4 w-4" />
            Export Excel (CSV)
          </a>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <a href="/api/marketplace/analytics/export?format=pdf" target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </a>
        </Button>
      </div>

      {model.budgetAlertLevel !== "none" ? (
        <Card
          className={
            model.budgetAlertLevel === "critical"
              ? "border-destructive/50 bg-destructive/5"
              : "border-amber-500/40 bg-amber-500/5"
          }
        >
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">
                {model.budgetAlertLevel === "critical"
                  ? "Procurement budget exceeded"
                  : "Procurement budget at 85%+"}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(model.spendThisMonth, "USD")} of{" "}
                {formatCurrency(model.settings.monthlyBudgetUsd ?? 0, "USD")} monthly budget used.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Spend this month"
          value={formatCurrency(model.spendThisMonth, "USD")}
          hint={`${model.orderCountThisMonth} orders`}
        />
        <KpiCard
          label="Last month"
          value={formatCurrency(model.spendLastMonth, "USD")}
          hint="Comparable period"
        />
        <KpiCard
          label="Budget used"
          value={model.budgetProgressPercent != null ? `${model.budgetProgressPercent}%` : "—"}
          hint={
            model.settings.monthlyBudgetUsd
              ? `of ${formatCurrency(model.settings.monthlyBudgetUsd, "USD")}`
              : "Set a monthly budget"
          }
        />
        <KpiCard
          label="Low-stock items"
          value={String(model.inventory.openReorderCount)}
          hint="Inventory reorder queue"
        />
      </div>

      {canManageBudget ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Monthly procurement budget</CardTitle>
            <CardDescription>Alerts trigger at 85% and when exceeded.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const raw = String(data.get("monthlyBudgetUsd") ?? "").trim();
                startTransition(async () => {
                  const result = await updateMarketplaceBudgetAction(
                    raw ? Number(raw) : null,
                  );
                  if (result.ok) toast.success("Budget updated");
                  else toast.error(result.error);
                });
              }}
            >
              <div className="flex-1">
                <Label htmlFor="monthlyBudgetUsd">Budget (USD)</Label>
                <Input
                  id="monthlyBudgetUsd"
                  name="monthlyBudgetUsd"
                  type="number"
                  min={0}
                  step={100}
                  defaultValue={model.settings.monthlyBudgetUsd ?? ""}
                  placeholder="5000"
                />
              </div>
              <Button type="submit" disabled={pending} className="rounded-full">
                Save budget
              </Button>
            </form>
            {model.budgetProgressPercent != null ? (
              <Progress value={model.budgetProgressPercent} className="mt-4 h-2" />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Spend by category</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketplaceSpendDonutChart data={model.spendByCategory} />
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Spend by vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketplaceSpendBarChart data={model.spendByVendor} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Spend over time</CardTitle>
          <CardDescription>Last 6 months · spend and order volume</CardDescription>
        </CardHeader>
        <CardContent>
          <MarketplaceSpendLineChart data={model.spendTrend} />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Cost per unit tracking</CardTitle>
          <CardDescription>Latest vs average unit price over the last 90 days</CardDescription>
        </CardHeader>
        <CardContent>
          <MarketplaceCostPerUnitTable rows={model.costPerUnit} />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Inventory integration</CardTitle>
          <CardDescription>
            Open reorder queue items and suggested marketplace replenishment SKUs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {model.inventory.reorderItems.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {model.inventory.reorderItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2"
                >
                  <span>{item.ingredientName}</span>
                  <Badge variant="outline" className="rounded-full capitalize">
                    {item.urgency}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No open inventory reorder items.</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/purchasing/reorder-queue">Open reorder queue</Link>
            </Button>
          </div>

          {model.inventory.suggestedProducts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {model.inventory.suggestedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/dashboard/marketplace/products/${product.slug}`}
                  className="flex items-start gap-3 rounded-xl border border-border/70 p-3 hover:bg-muted/40"
                >
                  <Package className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.vendorName} · {formatCurrency(product.basePrice, "USD")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
