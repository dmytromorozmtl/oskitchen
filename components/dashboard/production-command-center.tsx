"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ChefHat, MapPin, Timer } from "lucide-react";

import {
  generateProductionMenuPrepFormAction,
  generateProductionOrdersFormAction,
  updateProductionWorkItemStatusFormAction,
} from "@/actions/production";
import { ProductionTable, type ProductionRowDTO } from "@/components/dashboard/production-table";
import { StationHandoffPanel } from "@/components/production/station-handoff-panel";
import { ProductionBoardAttentionStrip } from "@/components/production/production-board-attention-strip";
import { ProductionWorkItemNextAction } from "@/components/production/production-work-item-next-action";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { normalizeProductionView, type ProductionView } from "@/lib/production/production-views";
import { buildProductionBoardFocusSnapshot } from "@/lib/production/production-board-focus-era18";
import { BOARD_STATUS_ORDER, PRODUCTION_WORK_STATUS_LABEL } from "@/lib/production/production-status";
import type { ProductionEmptyStateCopy } from "@/lib/production/production-modes";
import type { ProductionBatchStatus, ProductionCommandMode, ProductionWorkStatus } from "@prisma/client";

export type ProductionWorkItemDTO = {
  id: string;
  title: string;
  quantity: number;
  station: string | null;
  stage: string | null;
  status: ProductionWorkStatus;
  sourceType: string;
  dueAt: string | null;
  requiresPacking: boolean;
  requiresLabel: boolean;
  allergenWarning: string | null;
};

export type ProductionBatchDTO = {
  id: string;
  title: string;
  mode: ProductionCommandMode;
  status: ProductionBatchStatus;
  totalItems: number;
  completedItems: number;
  productionDate: string;
};

export type ProductionKpiDTO = {
  tasksToday: number;
  completed: number;
  inProgress: number;
  lateOrRisk: number;
  packingHandoff: number;
  estimatedPrepMinutes: number;
  stationWarnings: { station: string; count: number; overloaded: boolean }[];
};

export function ProductionCommandCenter({
  pageTitle,
  pageSubtitle,
  productionDateIso,
  emptyCopy,
  kpis,
  workItems,
  batches,
  legacyRows,
  stationNames = [],
  view: viewProp,
}: {
  pageTitle: string;
  pageSubtitle: string;
  productionDateIso: string;
  emptyCopy: ProductionEmptyStateCopy;
  kpis: ProductionKpiDTO;
  workItems: ProductionWorkItemDTO[];
  batches: ProductionBatchDTO[];
  legacyRows: ProductionRowDTO[];
  stationNames?: string[];
  view: ProductionView;
}) {
  const router = useRouter();
  const view = normalizeProductionView(viewProp);

  const dateStr = productionDateIso.slice(0, 10);
  const dateHref = (next: string, v: ProductionView = view) =>
    `/dashboard/production?date=${encodeURIComponent(next)}&view=${v}`;

  const hasAnyWork = workItems.length > 0 || legacyRows.length > 0;

  const groupedPrep = React.useMemo(() => {
    const m = new Map<string, ProductionWorkItemDTO[]>();
    for (const w of workItems) {
      const key = w.station?.trim() || "Unassigned";
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(w);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [workItems]);

  const boardFocus = React.useMemo(
    () =>
      buildProductionBoardFocusSnapshot(
        workItems.map((item) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          station: item.station,
          dueAt: item.dueAt,
          requiresPacking: item.requiresPacking,
        })),
        kpis.stationWarnings,
      ),
    [workItems, kpis.stationWarnings],
  );

  const boardFocusItems = React.useMemo(
    () =>
      workItems.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        station: item.station,
        dueAt: item.dueAt,
        requiresPacking: item.requiresPacking,
      })),
    [workItems],
  );

  async function onStatusChange(workItemId: string, status: string) {
    const fd = new FormData();
    fd.set("workItemId", workItemId);
    fd.set("status", status);
    await updateProductionWorkItemStatusFormAction(fd);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{pageTitle}</h1>
            <Badge variant="outline" className="rounded-full">
              <ChefHat className="mr-1 h-3 w-3" />
              Command center
            </Badge>
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">{pageSubtitle}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              type="date"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={dateStr}
              onChange={(e) => router.push(dateHref(e.target.value))}
              aria-label="Production date"
            />
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href={`/dashboard/production/reports`}>Open reports</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/dashboard/production/templates">Templates</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/dashboard/kitchen">Kitchen screen</Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <form action={generateProductionMenuPrepFormAction}>
            <input type="hidden" name="productionDate" value={dateStr} />
            <input name="scaleFactor" type="number" min={1} step={1} defaultValue={1} className="h-9 w-16 rounded-xl border border-input bg-background px-2 text-sm" aria-label="Scale factor" />
            <Button type="submit" className="rounded-full" variant="premium">
              {emptyCopy.primaryLabel}
            </Button>
          </form>
          <form action={generateProductionOrdersFormAction}>
            <input type="hidden" name="productionDate" value={dateStr} />
            <Button type="submit" variant="outline" className="rounded-full">
              From orders
            </Button>
          </form>
        </div>
      </div>

      {hasAnyWork ? (
        <ProductionBoardAttentionStrip
          focus={boardFocus}
          workItems={boardFocusItems}
          stationWarnings={kpis.stationWarnings}
          productionDateIso={productionDateIso}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks (day)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{kpis.tasksToday}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{kpis.completed}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In progress</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{kpis.inProgress}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Late / risk</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{kpis.lateOrRisk}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pack / label handoff</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{kpis.packingHandoff}</CardContent>
        </Card>
        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Est. prep minutes (placeholder)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{kpis.estimatedPrepMinutes}</CardContent>
        </Card>
        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Station load
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-xs">
            {kpis.stationWarnings.length === 0 ? (
              <span className="text-muted-foreground">Assign stations on work items to see load.</span>
            ) : (
              kpis.stationWarnings.map((s) => (
                <Badge key={s.station} variant={s.overloaded ? "destructive" : "secondary"} className="rounded-full">
                  {s.station}: {s.count}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {!hasAnyWork ? (
        <EmptyState
          icon={ChefHat}
          title={emptyCopy.title}
          description={emptyCopy.description}
          primarySlot={
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
              <form action={generateProductionMenuPrepFormAction}>
                <input type="hidden" name="productionDate" value={dateStr} />
                <Button type="submit" className="rounded-full" variant="premium">
                  {emptyCopy.primaryLabel}
                </Button>
              </form>
              <form action={generateProductionOrdersFormAction}>
                <input type="hidden" name="productionDate" value={dateStr} />
                <Button type="submit" variant="outline" className="rounded-full">
                  From orders
                </Button>
              </form>
            </div>
          }
          secondaryLabel={emptyCopy.secondaryLabel}
          secondaryHref={emptyCopy.secondaryHref}
          demoHref="/demo"
        />
      ) : null}

      {hasAnyWork ? (
        <Tabs value={view} className="w-full">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 rounded-xl bg-muted/40 p-1">
            {(
              [
                ["board", "Board"],
                ["prep", "Prep list"],
                ["timeline", "Timeline"],
                ["stations", "Stations"],
                ["batches", "Batches"],
                ["orders", "Orders source"],
                ["ingredients", "Ingredients"],
                ["reports", "Reports"],
              ] as const
            ).map(([id, label]) => (
              <TabsTrigger key={id} value={id} asChild className="rounded-lg">
                <Link href={`/dashboard/production?date=${dateStr}&view=${id}`}>{label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="board" className="mt-6">
            <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
              {BOARD_STATUS_ORDER.filter((s) => s !== "DONE" && s !== "CANCELLED").map((status) => (
                <Card key={status} className="border-border/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{PRODUCTION_WORK_STATUS_LABEL[status]}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {workItems
                      .filter((w) => w.status === status)
                      .map((w) => (
                        <div
                          key={w.id}
                          id={`production-work-${w.id}`}
                          className="scroll-mt-24 rounded-lg border border-border/70 bg-card/80 p-3 text-sm"
                        >
                          <p className="font-medium leading-snug">{w.title}</p>
                          <p className="text-xs text-muted-foreground">×{w.quantity}</p>
                          <ProductionWorkItemNextAction
                            item={{
                              id: w.id,
                              title: w.title,
                              status: w.status,
                              station: w.station,
                              dueAt: w.dueAt,
                              requiresPacking: w.requiresPacking,
                            }}
                          />
                          {w.allergenWarning ? (
                            <Badge variant="destructive" className="mt-2 rounded-full text-[10px]">
                              Allergen
                            </Badge>
                          ) : null}
                          <div className="mt-2">
                            <Select value={w.status} onValueChange={(v) => void onStatusChange(w.id, v)}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BOARD_STATUS_ORDER.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {PRODUCTION_WORK_STATUS_LABEL[s]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    {!workItems.filter((w) => w.status === status).length ? (
                      <p className="text-xs text-muted-foreground">—</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prep" className="mt-6 space-y-6">
            {groupedPrep.map(([station, items]) => (
              <Card key={station}>
                <CardHeader>
                  <CardTitle className="text-base">{station}</CardTitle>
                  <CardDescription>
                    {items.length} line{items.length === 1 ? "" : "s"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((w) => (
                    <div
                      key={w.id}
                      id={`production-work-${w.id}`}
                      className="scroll-mt-24 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{w.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {PRODUCTION_WORK_STATUS_LABEL[w.status]} · qty {w.quantity}
                          {w.dueAt ? ` · due ${format(parseISO(w.dueAt), "MMM d h:mm a")}` : ""}
                        </p>
                        <ProductionWorkItemNextAction
                          item={{
                            id: w.id,
                            title: w.title,
                            status: w.status,
                            station: w.station,
                            dueAt: w.dueAt,
                            requiresPacking: w.requiresPacking,
                          }}
                        />
                      </div>
                      <Badge variant="outline" className="rounded-full text-[10px]">
                        {w.sourceType}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>
                  Gantt-style prep vs pickup windows — next: chart dueAt vs station capacity.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="stations" className="mt-6 space-y-4">
            <StationHandoffPanel
              workItems={workItems}
              stations={
                stationNames.length
                  ? stationNames
                  : [...new Set(workItems.map((w) => w.station?.trim()).filter(Boolean) as string[])]
              }
            />
          </TabsContent>

          <TabsContent value="batches" className="mt-6 space-y-3">
            {batches.map((b) => (
              <Card key={b.id}>
                <CardHeader>
                  <CardTitle className="text-base">{b.title}</CardTitle>
                  <CardDescription>
                    {b.mode} · {b.status} · {b.completedItems}/{b.totalItems} lines
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
            {!batches.length ? <p className="text-sm text-muted-foreground">No batches for this date.</p> : null}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders source</CardTitle>
                <CardDescription>
                  Work items with ORDER source trace to order lines. Duplicates are skipped on regenerate.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>Connect to ingredient demand from recipes (planned).</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Button asChild className="rounded-full">
              <Link href="/dashboard/production/reports">Open production reports</Link>
            </Button>
          </TabsContent>
        </Tabs>
      ) : null}

      {legacyRows.length > 0 || workItems.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Execution layer</h2>
          <ProductionTable rows={legacyRows} embedded />
        </div>
      ) : null}
    </div>
  );
}
