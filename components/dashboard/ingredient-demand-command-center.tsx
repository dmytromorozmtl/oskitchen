"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useMemo, useState, useTransition } from "react";

import { runDemandCalculationAndSaveAction } from "@/app/dashboard/inventory/demand/actions";
import { DemandCsvDownload } from "@/components/dashboard/demand-csv-download";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeletonRows } from "@/components/tables/table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { classifyShortages, groupDemandRowsBySupplier } from "@/lib/ingredient-demand/demand-grouping";
import { DEMAND_SOURCE_CATALOG } from "@/lib/ingredient-demand/demand-sources";
import type { DemandCommandCenterPayload } from "@/services/ingredient-demand/demand-service";

type Props = { initial: DemandCommandCenterPayload };

export function IngredientDemandCommandCenter({ initial }: Props) {
  const [data] = useState(initial);
  const [tab, setTab] = useState("overview");
  const [dateFrom, setDateFrom] = useState(initial.window.from.slice(0, 10));
  const [dateTo, setDateTo] = useState(initial.window.to.slice(0, 10));
  const [brandId, setBrandId] = useState<string | "all">("all");
  const [locationId, setLocationId] = useState<string | "all">("all");
  const [pending, startTransition] = useTransition();

  const csvLines = useMemo(() => {
    const lines = [
      ["date", "ingredient", "unit", "required", "stock", "shortage", "supplier", "related_products"].join(","),
      ...data.rows.map((r) =>
        [
          r.dateKey,
          csvEscape(r.name),
          r.unit,
          r.required,
          r.stock,
          r.shortage,
          csvEscape(r.supplier ?? ""),
          csvEscape(r.relatedProducts.join("; ")),
        ].join(","),
      ),
    ];
    return lines.join("\n");
  }, [data.rows]);

  const supplierGroups = useMemo(() => groupDemandRowsBySupplier(data.rows), [data.rows]);
  const shortageRows = useMemo(() => classifyShortages(data.rows), [data.rows]);

  const productRollup = useMemo(() => {
    const m = new Map<string, { qty: number; sources: Set<string> }>();
    for (const c of data.contributions) {
      const prev = m.get(c.productId) ?? { qty: 0, sources: new Set<string>() };
      prev.qty += c.quantity;
      prev.sources.add(c.source);
      m.set(c.productId, prev);
    }
    return [...m.entries()].sort((a, b) => b[1].qty - a[1].qty);
  }, [data.contributions]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Ingredient demand</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Calculate ingredient requirements from orders, production plans, menus, forecasts, batches, and events.
            Purchasing and costing continue to consume the same rolled-up rows — CSV columns stay compatible.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DemandCsvDownload csv={csvLines} disabled={data.rows.length === 0} />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/purchasing">Open purchasing</Link>
          </Button>
        </div>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Run demand</CardTitle>
          <CardDescription>
            Date range, brand, and location filters apply to both orders and production-backed contributions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="df">From</Label>
            <Input id="df" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dt">To</Label>
            <Input id="dt" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Brand</Label>
            <Select value={brandId} onValueChange={(v) => setBrandId(v as typeof brandId)}>
              <SelectTrigger>
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands in window</SelectItem>
                {data.brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={locationId} onValueChange={(v) => setLocationId(v as typeof locationId)}>
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {data.locations.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex flex-wrap gap-2">
            <Button
              type="button"
              className="rounded-full"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const res = await runDemandCalculationAndSaveAction({
                    dateFromIso: `${dateFrom}T12:00:00.000Z`,
                    dateToIso: `${dateTo}T12:00:00.000Z`,
                    brandId: brandId === "all" ? null : brandId,
                    locationId: locationId === "all" ? null : locationId,
                  });
                  if (res.ok) {
                    window.location.href = `/dashboard/inventory/demand?saved=${encodeURIComponent(res.runId)}`;
                  }
                });
              }}
            >
              {pending ? "Running…" : "Run demand calculation & save"}
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/inventory/demand/settings">Waste & sources</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title="Ingredients required" value={String(data.totals.ingredientLineCount)} />
        <Kpi title="Shortage lines" value={String(data.totals.shortageLineCount)} accent="amber" />
        <Kpi title="Est. ingredient cost" value={data.totals.estimatedCostTotal.toFixed(2)} />
        <Kpi title="Recipes missing / blocked" value={String(data.totals.recipesMissingCount)} />
        <Kpi title="Purchase needed (numeric short)" value={String(data.totals.purchaseNeededLines)} />
        <Kpi title="Global waste buffer" value={`${data.settings.globalWasteBufferPercent}%`} />
        <Kpi title="Suppliers touched" value={String(data.totals.suppliersDistinct)} />
        <Kpi
          title="Signals"
          value={`${data.ordersConsidered} orders · ${data.productionItemsConsidered} prod. · ${data.recipesLinked} recipes`}
        />
      </div>

      {data.latestRun ? (
        <p className="text-xs text-muted-foreground">
          Last saved run: <span className="font-medium text-foreground">{data.latestRun.title}</span> (
          {data.latestRun.status.toLowerCase()}) · {format(new Date(data.latestRun.createdAt), "MMM d, h:mm a")}
        </p>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lines">Demand lines</TabsTrigger>
          <TabsTrigger value="shortages">Shortages</TabsTrigger>
          <TabsTrigger value="product">By product</TabsTrigger>
          <TabsTrigger value="supplier">By supplier</TabsTrigger>
          <TabsTrigger value="missing">Recipes missing</TabsTrigger>
          <TabsTrigger value="substitutions">Substitutions</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Warnings & info</CardTitle>
              <CardDescription>Conversion gaps and stub sources never fail silently.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {data.warnings.length === 0 ? (
                <p className="text-muted-foreground">No warnings for this window.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5">
                  {data.warnings.map((w, i) => (
                    <li key={`${w.code}-${i}`} className={w.severity === "error" ? "text-destructive" : ""}>
                      {w.message}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sources enabled</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {DEMAND_SOURCE_CATALOG.filter((s) => data.settings.enabledSources[s.id]?.enabled).map((s) => (
                <Badge key={s.id} variant="secondary" className="rounded-full">
                  {s.label}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lines" className="pt-4">
          <DemandLinesTable rows={data.rows} />
        </TabsContent>

        <TabsContent value="shortages" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shortages & blockers</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {shortageRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No shortage or conversion blockers in this window.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kind</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Ingredient</TableHead>
                      <TableHead className="text-right">Short</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shortageRows.map((s) => (
                      <TableRow key={`${s.ingredientId}-${s.dateKey}-${s.kind}`}>
                        <TableCell className="text-xs uppercase text-muted-foreground">
                          {s.kind.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>{format(new Date(s.dateKey), "MMM d")}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{s.shortage}</TableCell>
                        <TableCell>{s.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Demand drivers (contributions)</CardTitle>
              <CardDescription>Effective quantities after source confidence multipliers.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Sources</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productRollup.map(([pid, v]) => (
                    <TableRow key={pid}>
                      <TableCell className="font-mono text-xs">{pid}</TableCell>
                      <TableCell className="text-right tabular-nums">{Math.round(v.qty * 100) / 100}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{[...v.sources].join(", ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplier" className="pt-4">
          <div className="space-y-6">
            {[...supplierGroups.entries()].map(([supplier, lines]) => (
              <Card key={supplier}>
                <CardHeader>
                  <CardTitle className="text-base">{supplier}</CardTitle>
                  <CardDescription>{lines.length} ingredient-day lines</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-1">
                    {lines.slice(0, 8).map((l) => (
                      <li key={`${l.ingredientId}-${l.dateKey}`}>
                        {format(new Date(l.dateKey), "MMM d")} · {l.name}:{" "}
                        <span className="font-medium text-foreground">
                          {l.required} {l.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {lines.length > 8 ? (
                    <p className="mt-2 text-xs">+{lines.length - 8} more — export CSV for the full list.</p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="missing" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recipes missing or blocked</CardTitle>
            </CardHeader>
            <CardContent>
              {data.missingRecipes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Every contribution in-window resolved to an active recipe.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.missingRecipes.map((m) => (
                    <li key={`${m.productId}-${m.reason}`}>
                      <span className="font-medium">{m.productTitle}</span>{" "}
                      <Badge variant="outline" className="ml-2 rounded-full text-xs">
                        {m.reason.replace(/_/g, " ")}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="substitutions" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ingredient substitutions</CardTitle>
              <CardDescription>
                Swaps may affect allergens, nutrition, and cost — review before purchasing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.substitutions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active substitutions on file.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Substitute</TableHead>
                      <TableHead>Ratio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.substitutions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.ingredientId}</TableCell>
                        <TableCell className="font-mono text-xs">{s.substituteIngredientId}</TableCell>
                        <TableCell>{s.conversionRatio ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export & purchasing bridge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                CSV uses the legacy column order so commissary scripts keep working. Saved demand runs appear in the
                header above; open Purchasing any time — it reads the same live rollup as this page.
              </p>
              <DemandCsvDownload csv={csvLines} disabled={data.rows.length === 0} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        PDF prep sheets can reuse the same engine — today CSV + Purchasing covers the bridge.{" "}
        <Link href="/dashboard/purchasing" className="underline underline-offset-4">
          Back to Purchasing
        </Link>
        .
      </p>
    </div>
  );
}

function Kpi({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent?: "amber";
}) {
  return (
    <Card className={accent === "amber" ? "border-amber-500/40" : "border-border/80"}>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle
          className={`text-2xl font-semibold ${accent === "amber" ? "text-amber-700 dark:text-amber-400" : ""}`}
        >
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function DemandLinesTable({ rows }: { rows: DemandCommandCenterPayload["rows"] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">No ingredient demand yet</p>
          <p className="mt-2">
            Run a demand calculation from orders, production plans, menus, events, or forecasts — or widen your date
            window.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prep date</TableHead>
            <TableHead>Ingredient</TableHead>
            <TableHead className="text-right">Required</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Short</TableHead>
            <TableHead>Signals</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={`${r.ingredientId}-${r.dateKey}`}>
              <TableCell>{format(new Date(r.dateKey), "EEE MMM d")}</TableCell>
              <TableCell className="font-medium">
                {r.name}
                <span className="block text-xs font-normal text-muted-foreground">
                  {r.unit}
                  {r.supplier ? ` · ${r.supplier}` : ""}
                  {r.conversionRequired ? " · conversion required" : ""}
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">{r.required}</TableCell>
              <TableCell className="text-right tabular-nums">{r.stock}</TableCell>
              <TableCell className="text-right tabular-nums text-amber-700 dark:text-amber-400">
                {r.shortage > 0 ? r.shortage : "—"}
              </TableCell>
              <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                {r.relatedProducts.slice(0, 4).join(", ")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function csvEscape(cell: string): string {
  if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}
