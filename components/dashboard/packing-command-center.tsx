"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BusinessType, PackingCommandMode } from "@prisma/client";
import { ClipboardCheck, Package, Printer, Route } from "lucide-react";

import {
  createPackingWaveAction,
  generatePackingQueueAction,
  markLabelPrintedPlaceholderAction,
  updatePackingTaskStatusAction,
} from "@/actions/packing";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PackingExportsPanel } from "@/components/dashboard/packing-client";
import { PackingAttentionStrip } from "@/components/packing/packing-attention-strip";
import { PackingQcChecklist } from "@/components/packing/packing-qc-checklist";
import { PackingQcHero } from "@/components/packing/packing-qc-hero";
import { PackingTaskNextAction } from "@/components/packing/packing-task-next-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PackingKpis } from "@/lib/packing/packing-kpis";
import {
  buildPackingFocusSnapshot,
  shouldShowPackingAttentionStrip,
} from "@/lib/packing/packing-focus-era18";
import {
  PACKING_COMMAND_MODES,
  packingEmptyStateForBusiness,
  packingModeLabel,
} from "@/lib/packing/packing-modes";
import type { PackingOrderDTO } from "@/lib/packing/packing-order-dto";
import { packingPageSubtitle, packingPageTitle } from "@/lib/packing/packing-terminology";
import { partitionFulfillment } from "@/lib/packing/packing-grouping";
import type { PackingTaskCardDTO, PackingWaveRowDTO } from "@/services/packing/load-packing-page-data";

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader className="pb-2 pt-4">
        <CardDescription className="text-xs font-medium uppercase tracking-wide">{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function buildPackingHref(opts: {
  date: string;
  mode: PackingCommandMode;
  fulfillment: "ALL" | "PICKUP" | "DELIVERY";
}) {
  const p = new URLSearchParams();
  p.set("date", opts.date);
  p.set("mode", opts.mode);
  p.set("fulfillment", opts.fulfillment);
  return `/dashboard/packing?${p.toString()}`;
}

export function PackingCommandCenter({
  businessType,
  packingDateStr,
  mode,
  fulfillment,
  orders,
  tasks,
  waves,
  kpis,
  labelTemplateCount,
}: {
  businessType: BusinessType | null;
  packingDateStr: string;
  mode: PackingCommandMode;
  fulfillment: "ALL" | "PICKUP" | "DELIVERY";
  orders: PackingOrderDTO[];
  tasks: PackingTaskCardDTO[];
  waves: PackingWaveRowDTO[];
  kpis: PackingKpis;
  labelTemplateCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [flash, setFlash] = React.useState<string | null>(null);
  const emptyCopy = packingEmptyStateForBusiness(businessType);
  const title = packingPageTitle(businessType);
  const subtitle = packingPageSubtitle();
  const showEmpty = orders.length === 0 && tasks.length === 0;

  function navigate(next: { date?: string; mode?: PackingCommandMode; fulfillment?: typeof fulfillment }) {
    const href = buildPackingHref({
      date: next.date ?? packingDateStr,
      mode: next.mode ?? mode,
      fulfillment: next.fulfillment ?? fulfillment,
    });
    startTransition(() => router.replace(href));
  }

  async function onGenerateQueue(fd: FormData): Promise<void> {
    const res = await generatePackingQueueAction(fd);
    if ("error" in res && res.error) {
      setFlash(res.error);
      return;
    }
    if ("ok" in res && res.ok) {
      setFlash(`Queued ${res.tasksCreated} packing line(s).`);
      startTransition(() => router.refresh());
    }
  }

  async function onWaveCreate(fd: FormData): Promise<void> {
    const res = await createPackingWaveAction(fd);
    if ("error" in res && res.error) {
      setFlash(res.error);
      return;
    }
    if ("ok" in res && res.ok) {
      setFlash("Wave created.");
      startTransition(() => router.refresh());
    }
  }

  async function flushTaskStatus(fd: FormData): Promise<void> {
    await updatePackingTaskStatusAction(fd);
    startTransition(() => router.refresh());
  }

  async function flushLabelPrinted(fd: FormData): Promise<void> {
    await markLabelPrintedPlaceholderAction(fd);
    startTransition(() => router.refresh());
  }

  const lanes = partitionFulfillment(orders);
  const packingFocusTasks = React.useMemo(
    () =>
      tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        customerName: task.customerName,
        requiresLabel: task.requiresLabel,
        requiresNutritionLabel: task.requiresNutritionLabel,
        requiresAllergenCheck: task.requiresAllergenCheck,
        labelPrintedAt: task.labelPrintedAt,
        fulfillmentType: task.fulfillmentType,
      })),
    [tasks],
  );
  const packingFocus = React.useMemo(
    () => buildPackingFocusSnapshot(packingFocusTasks),
    [packingFocusTasks],
  );
  const showPackingAttentionStrip = shouldShowPackingAttentionStrip(packingFocus);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="pack-date" className="text-xs text-muted-foreground">
              Packing day
            </Label>
            <Input
              id="pack-date"
              type="date"
              className="w-[11rem] rounded-xl"
              value={packingDateStr}
              disabled={pending}
              onChange={(e) => navigate({ date: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Fulfillment</Label>
            <select
              className="flex h-10 rounded-xl border border-input bg-background px-3 text-sm"
              value={fulfillment}
              disabled={pending}
              onChange={(e) =>
                navigate({ fulfillment: e.target.value as "ALL" | "PICKUP" | "DELIVERY" })
              }
            >
              <option value="ALL">All</option>
              <option value="PICKUP">Pickup</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Mode</Label>
            <select
              className="flex h-10 min-w-[10rem] rounded-xl border border-input bg-background px-3 text-sm"
              value={mode}
              disabled={pending}
              onChange={(e) => navigate({ mode: e.target.value as PackingCommandMode })}
            >
              {PACKING_COMMAND_MODES.map((m) => (
                <option key={m} value={m}>
                  {packingModeLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {flash ? (
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm text-foreground">{flash}</p>
      ) : null}

      <div id="generate-queue" className="rounded-2xl border border-border/80 bg-muted/20 p-4 lg:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">Generate packing queue</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Build line-level tasks from orders in Confirmed / Preparing / Ready. Existing open tasks for the same
              order lines are skipped so you can regenerate safely.
            </p>
          </div>
          <form action={onGenerateQueue} className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <input type="hidden" name="packingDate" value={packingDateStr} />
            <input type="hidden" name="mode" value={mode} />
            <Button type="submit" variant="premium" className="min-h-12 rounded-full px-6 text-base" disabled={pending}>
              Generate packing queue
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Orders (tasks / pipeline)" value={kpis.ordersToPack} />
        <Kpi label="Items to pack" value={kpis.itemsToPack} />
        <Kpi label="Packed items" value={kpis.packedItems} />
        <Kpi label="Verified lines" value={kpis.verifiedTasks} />
        <Kpi label="Labels missing" value={kpis.labelsMissing} />
        <Kpi label="Allergen checks open" value={kpis.allergenChecksOpen} />
        <Kpi label="Pickup ready (orders)" value={kpis.pickupReadyOrders} />
        <Kpi label="Delivery ready (orders)" value={kpis.deliveryReadyOrders} />
      </div>

      {showPackingAttentionStrip ? (
        <PackingAttentionStrip
          focus={packingFocus}
          tasks={packingFocusTasks}
          kpis={kpis}
        />
      ) : null}

      <div className="space-y-3" data-testid="packing-qc-strip">
        <PackingQcHero focus={packingFocus} hasTasks={tasks.length > 0} />
        <PackingQcChecklist focus={packingFocus} hasTasks={tasks.length > 0} />
      </div>

      {showEmpty ? (
        <EmptyState
          icon={Package}
          title={emptyCopy.title}
          description={emptyCopy.description}
          primaryLabel={emptyCopy.primaryLabel}
          primaryHref={emptyCopy.primaryHref}
          secondaryLabel={emptyCopy.secondaryLabel}
          secondaryHref={emptyCopy.secondaryHref}
        />
      ) : null}

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="flex h-auto min-h-12 flex-wrap justify-start gap-1 rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="queue" className="rounded-xl px-3 py-2 text-sm">
            Queue
          </TabsTrigger>
          <TabsTrigger value="waves" className="rounded-xl px-3 py-2 text-sm">
            Waves
          </TabsTrigger>
          <TabsTrigger value="customer" className="rounded-xl px-3 py-2 text-sm">
            By customer
          </TabsTrigger>
          <TabsTrigger value="route" className="rounded-xl px-3 py-2 text-sm">
            By route
          </TabsTrigger>
          <TabsTrigger value="window" className="rounded-xl px-3 py-2 text-sm">
            By pickup window
          </TabsTrigger>
          <TabsTrigger value="labels" className="rounded-xl px-3 py-2 text-sm">
            Labels
          </TabsTrigger>
          <TabsTrigger value="verification" className="rounded-xl px-3 py-2 text-sm">
            Verification
          </TabsTrigger>
          <TabsTrigger value="exports" className="rounded-xl px-3 py-2 text-sm">
            Exports
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-xl px-3 py-2 text-sm">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4 space-y-4" id="packing-queue">
          {tasks.length === 0 ? (
            <Card className="border-dashed p-6 text-center text-sm text-muted-foreground">
              No packing tasks for this day yet. Generate a queue above, or pick another date.
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <Card key={t.id} id={`packing-task-${t.id}`} className="scroll-mt-24 border-border/80 shadow-sm">
                  <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{t.fulfillmentType}</Badge>
                        <Badge variant="outline">{t.status.replace(/_/g, " ")}</Badge>
                        {t.requiresAllergenCheck ? (
                          <Badge className="bg-amber-600 hover:bg-amber-600">Allergen</Badge>
                        ) : null}
                        {t.requiresNutritionLabel ? <Badge variant="outline">Nutrition</Badge> : null}
                      </div>
                      <p className="font-medium leading-snug">{t.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.customerName} · Qty {t.quantity}
                        {t.batchTitle ? ` · ${t.batchTitle}` : ""}
                        {t.routeLabel ? ` · ${t.routeLabel}` : ""}
                      </p>
                      <PackingTaskNextAction
                        task={{
                          id: t.id,
                          title: t.title,
                          status: t.status,
                          customerName: t.customerName,
                          requiresLabel: t.requiresLabel,
                          requiresNutritionLabel: t.requiresNutritionLabel,
                          requiresAllergenCheck: t.requiresAllergenCheck,
                          labelPrintedAt: t.labelPrintedAt,
                          fulfillmentType: t.fulfillmentType,
                        }}
                      />
                      {t.allergenSummary ? (
                        <p className="text-xs text-amber-800 dark:text-amber-200">Allergens (product): {t.allergenSummary}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <form action={flushTaskStatus}>
                        <input type="hidden" name="taskId" value={t.id} />
                        <input type="hidden" name="status" value="PACKED" />
                        <Button type="submit" variant="secondary" className="min-h-11 rounded-full" disabled={pending}>
                          Mark packed
                        </Button>
                      </form>
                      <form action={flushTaskStatus}>
                        <input type="hidden" name="taskId" value={t.id} />
                        <input type="hidden" name="status" value="VERIFIED" />
                        <Button type="submit" variant="default" className="min-h-11 rounded-full" disabled={pending}>
                          Mark verified
                        </Button>
                      </form>
                      <form action={flushLabelPrinted}>
                        <input type="hidden" name="taskId" value={t.id} />
                        <Button
                          type="submit"
                          variant="outline"
                          className="min-h-11 rounded-full"
                          disabled={pending || Boolean(t.labelPrintedAt)}
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          {t.labelPrintedAt ? "Label logged" : "Log label printed"}
                        </Button>
                      </form>
                      <Button asChild variant="outline" className="min-h-11 rounded-full">
                        <Link href="/dashboard/packing/verify">
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          Packing verify
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="waves" className="mt-4 space-y-4">
          <Card className="border-border/80 p-4 shadow-sm">
            <p className="text-sm font-medium">Create packing wave</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Group a slice of the day (for example pickup 3–5 PM or a route). Assigning tasks to waves from the UI is
              coming next; today you can name waves and track them alongside batches.
            </p>
            <form action={onWaveCreate} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <input type="hidden" name="packingDate" value={packingDateStr} />
              <div className="flex-1 space-y-1">
                <Label htmlFor="wave-title">Title</Label>
                <Input id="wave-title" name="title" placeholder="Pickup 3–5 PM" className="rounded-xl" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="wave-ft">Lane</Label>
                <select id="wave-ft" name="fulfillmentType" className="flex h-10 rounded-xl border border-input bg-background px-3 text-sm">
                  <option value="">Any</option>
                  <option value="PICKUP">Pickup</option>
                  <option value="DELIVERY">Delivery</option>
                </select>
              </div>
              <Button type="submit" className="min-h-11 rounded-full" disabled={pending}>
                Create wave
              </Button>
            </form>
          </Card>
          {waves.length === 0 ? (
            <p className="text-sm text-muted-foreground">No waves for this day.</p>
          ) : (
            <ul className="space-y-2">
              {waves.map((w) => (
                <li key={w.id}>
                  <Card className="border-border/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{w.title}</p>
                      <Badge variant="outline">{w.taskCount} tasks</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {w.fulfillmentType ?? "Any lane"} · {w.status}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="customer" className="mt-4 space-y-3">
          {orders.map((o) => (
            <Card key={o.id} className="border-border/80 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{o.customerName}</p>
                <Badge variant="secondary">{o.fulfillmentType}</Badge>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {o.items.map((i) => (
                  <li key={i.orderItemId}>
                    {i.quantity}× {i.title}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="route" className="mt-4 space-y-3">
          {(() => {
            const groups = new Map<string, PackingTaskCardDTO[]>();
            for (const t of tasks) {
              const key = t.routeLabel ?? "Unassigned route";
              if (!groups.has(key)) groups.set(key, []);
              groups.get(key)!.push(t);
            }
            if (!tasks.length) {
              return <p className="text-sm text-muted-foreground">No tasks — generate a queue first.</p>;
            }
            return Array.from(groups.entries()).map(([label, rows]) => (
              <Card key={label} className="border-border/80 p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{label}</p>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {rows.map((r) => (
                    <li key={r.id}>
                      {r.title} · {r.status}
                    </li>
                  ))}
                </ul>
              </Card>
            ));
          })()}
        </TabsContent>

        <TabsContent value="window" className="mt-4 space-y-3">
          {(() => {
            const groups = new Map<string, PackingTaskCardDTO[]>();
            for (const t of tasks) {
              const key = t.pickupWindow ?? "Pickup window TBD";
              if (!groups.has(key)) groups.set(key, []);
              groups.get(key)!.push(t);
            }
            if (!tasks.length) {
              return (
                <p className="text-sm text-muted-foreground">
                  Pickup windows will populate from tasks once routes/windows are captured on orders.
                </p>
              );
            }
            return Array.from(groups.entries()).map(([label, rows]) => (
              <Card key={label} className="border-border/80 p-4 shadow-sm">
                <p className="font-medium">{label}</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {rows.map((r) => (
                    <li key={r.id}>
                      {r.title} · {r.fulfillmentType}
                    </li>
                  ))}
                </ul>
              </Card>
            ));
          })()}
        </TabsContent>

        <TabsContent value="labels" className="mt-4 space-y-4">
          <Card className="border-border/80 p-4 shadow-sm">
            <p className="font-medium">Label templates</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {labelTemplateCount} active template(s) on file. Printed label records require a template row — use{" "}
              <Link href="/dashboard/nutrition-labels" className="font-medium text-primary underline-offset-4 hover:underline">
                Nutrition labels
              </Link>{" "}
              for compliance-oriented nutrition output. OS Kitchen does not certify regulatory compliance.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="mt-4 space-y-4">
          <Card className="border-amber-700/30 bg-amber-50/40 p-4 dark:bg-amber-950/20">
            <p className="text-sm font-medium text-amber-950 dark:text-amber-100">Safety disclaimer</p>
            <p className="mt-2 text-sm text-amber-950/90 dark:text-amber-50/90">
              Your business is responsible for verifying allergen and nutrition data on every pack-out. OS Kitchen surfaces
              product-level hints only; it does not replace label review, manager sign-off, or local regulatory obligations.
            </p>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="default" className="min-h-11 rounded-full">
              <Link href="/dashboard/packing/verify">Open packing verify</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11 rounded-full">
              <Link href="/dashboard/nutrition-labels">Nutrition labels</Link>
            </Button>
          </div>
          <Card className="border-border/80 p-4 shadow-sm">
            <p className="text-sm font-medium">Lines needing allergen attention</p>
            <ul className="mt-2 space-y-2 text-sm">
              {tasks.filter((t) => t.requiresAllergenCheck && t.status !== "VERIFIED").length === 0 ? (
                <li className="text-muted-foreground">None outstanding for this day.</li>
              ) : (
                tasks
                  .filter((t) => t.requiresAllergenCheck && t.status !== "VERIFIED")
                  .map((t) => (
                    <li key={t.id} className="rounded-lg border border-border/70 px-3 py-2">
                      {t.title}
                      {t.allergenSummary ? ` — ${t.allergenSummary}` : ""}
                    </li>
                  ))
              )}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="mt-4">
          <PackingExportsPanel orders={orders} />
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Card className="border-border/80 p-6 shadow-sm">
            <p className="font-medium">Packing reports</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Deeper analytics (labels printed, verification misses, throughput by packer) live on the reports route.
            </p>
            <Button asChild className="mt-4 min-h-11 rounded-full" variant="secondary">
              <Link href="/dashboard/packing/reports">Open packing reports</Link>
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {!showEmpty ? (
        <Card className="border-border/80 bg-muted/20 p-4 shadow-sm lg:p-6">
          <p className="text-sm font-semibold">Fulfillment lanes (orders)</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/70 p-4">
              <p className="font-medium">Pickup</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{lanes.pickup.length}</p>
              <Button asChild variant="link" className="mt-2 h-auto px-0">
                <Link href="/dashboard/order-hub">Order hub</Link>
              </Button>
            </div>
            <div className="rounded-xl border border-border/70 p-4">
              <p className="font-medium">Delivery</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{lanes.delivery.length}</p>
              <Button asChild variant="link" className="mt-2 h-auto px-0">
                <Link href="/dashboard/production">Kitchen production</Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
