import Link from "next/link";

import { RecalculateCostingButton } from "@/components/dashboard/recalculate-costing-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanGate } from "@/components/plans/plan-gate";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { costingCommandCenterTitle } from "@/lib/costing/terminology";
import { formatCurrency } from "@/lib/utils";
import { loadCostingOverviewData } from "@/services/costing/costing-service";

function warningBadge(level: string) {
  if (level === "HIGH" || level === "MEDIUM") {
    return (
      <Badge variant="destructive" className="rounded-full">
        {level}
      </Badge>
    );
  }
  if (level === "LOW" || level === "INFO") {
    return (
      <Badge variant="secondary" className="rounded-full">
        {level}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full">
      OK
    </Badge>
  );
}

export default async function CostingPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const data = await loadCostingOverviewData(dataUserId);
  const title = costingCommandCenterTitle(data.businessType);

  return (
    <PlanGate userId={dataUserId} feature="costing" title="Costing & margin">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight capitalize">{title}</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Operational estimates from recipes, ingredient cards, labor assumptions, packaging, and{" "}
              <strong className="font-medium text-foreground">your</strong> channel fee rules — not tax,
              accounting, or partner payout advice. Verify with invoices and your accountant.
            </p>
            {data.latestRun ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Last run: {data.latestRun.title} ·{" "}
                {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
                  data.latestRun.createdAt,
                )}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <RecalculateCostingButton />
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/costing/scenarios">Create scenario</Link>
            </Button>
          </div>
        </div>

        <Card className="border-border/80 bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Safety & scope</CardTitle>
            <CardDescription>
              KitchenOS does not provide tax, legal, or accounting advice. Channel fee estimates use only the rates you
              configure — we do not ship third-party fee tables.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg. gross margin (last run)</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {data.kpis.avgGrossMarginPct != null ? `${data.kpis.avgGrossMarginPct.toFixed(1)}%` : "—"}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Below target ({data.targetMarginPercent.toFixed(0)}%)</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{data.kpis.itemsBelowTarget}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Missing recipes (items)</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{data.kpis.missingRecipes}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Zero-cost ingredients</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{data.kpis.missingIngredientCosts}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Est. profit / unit (sum if 1× each)</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {formatCurrency(data.kpis.estimatedUnitProfitSum)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Illustrative roll-up only — not sales-weighted P&amp;L.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Highest margin item</CardDescription>
              <CardTitle className="text-base leading-snug">
                {data.kpis.highestMarginTitle ?? "—"}
                {data.kpis.highestMarginPct != null ? (
                  <span className="mt-1 block text-sm font-normal text-muted-foreground tabular-nums">
                    {data.kpis.highestMarginPct.toFixed(1)}%
                  </span>
                ) : null}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Lowest margin item</CardDescription>
              <CardTitle className="text-base leading-snug">
                {data.kpis.lowestMarginTitle ?? "—"}
                {data.kpis.lowestMarginPct != null ? (
                  <span className="mt-1 block text-sm font-normal text-muted-foreground tabular-nums">
                    {data.kpis.lowestMarginPct.toFixed(1)}%
                  </span>
                ) : null}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Channel + card fees / revenue</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {data.kpis.channelFeesShareOfRevenuePct != null
                  ? `${data.kpis.channelFeesShareOfRevenuePct.toFixed(1)}%`
                  : "—"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recipes linked</CardTitle>
            <CardDescription>
              {data.recipeCount} active recipe(s). Items without recipes cannot roll into costing until you attach a
              recipe card.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Latest item margins</CardTitle>
            <CardDescription>
              From your most recent completed costing run. Target margin {data.targetMarginPercent.toFixed(0)}% ·
              warning below {data.warningMarginPercent.toFixed(0)}%.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {data.latestLines.length === 0 ? (
              <div className="space-y-3">
                {data.recipeCount === 0 ? (
                  <>
                    <h2 className="text-lg font-medium">Recipes are missing</h2>
                    <p className="max-w-xl text-sm text-muted-foreground">
                      Costing needs recipes or cost components before margins can be calculated.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild className="rounded-full">
                        <Link href="/dashboard/products/new">Create recipe</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-medium">No costing snapshots yet</h2>
                    <p className="max-w-xl text-sm text-muted-foreground">
                      Add recipes, ingredient costs, and prices, then run your first costing calculation.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <RecalculateCostingButton />
                      <Button asChild variant="outline" className="rounded-full">
                        <Link href="/dashboard/products/new">Add recipe / item</Link>
                      </Button>
                      <Button asChild variant="ghost" className="rounded-full">
                        <Link href="/dashboard/import-export">Import costs</Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Sale</TableHead>
                    <TableHead className="text-right">Ingredients</TableHead>
                    <TableHead className="text-right">Labor</TableHead>
                    <TableHead className="text-right">Pack</TableHead>
                    <TableHead className="text-right">Fees</TableHead>
                    <TableHead className="text-right">Total cost</TableHead>
                    <TableHead className="text-right">Margin %</TableHead>
                    <TableHead className="text-right">Food %</TableHead>
                    <TableHead className="text-right">Suggested</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.latestLines.map((row) => {
                    const fees = row.platformFee + row.paymentFee;
                    const low = row.grossMarginPercent < data.warningMarginPercent;
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          <Link href="/dashboard/products" className="underline-offset-4 hover:underline">
                            {row.itemTitle}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(row.salePrice)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(row.ingredientCost)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(row.laborCost)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(row.packagingCost)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(fees)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(row.totalCost)}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.grossMarginPercent.toFixed(1)}%</TableCell>
                        <TableCell className="text-right tabular-nums">{row.foodCostPercent.toFixed(1)}%</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.suggestedPrice != null ? formatCurrency(row.suggestedPrice) : "—"}
                        </TableCell>
                        <TableCell>
                          {low ? (
                            <Badge variant="destructive" className="rounded-full">
                              Below {data.warningMarginPercent.toFixed(0)}%
                            </Badge>
                          ) : (
                            warningBadge(row.warningLevel)
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          CSV: use{" "}
          <Link href="/dashboard/import-export" className="underline underline-offset-4">
            Import / export
          </Link>{" "}
          — costing CSV presets are described in the costing docs under <code className="text-xs">docs/</code>.
        </p>
      </div>
    </PlanGate>
  );
}
