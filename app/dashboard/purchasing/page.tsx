import Link from "next/link";
import { format } from "date-fns";
import { Package, Plus, ShoppingCart, Truck } from "lucide-react";

import { seedReorderFromDemandAction } from "@/app/dashboard/purchasing/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { PURCHASE_ORDER_STATUS_LABELS } from "@/lib/purchasing/purchasing-status";
import { evaluateInventoryShortageReadiness } from "@/services/inventory/inventory-shortage-readiness-service";
import { loadPurchasingDashboard } from "@/services/purchasing/purchasing-service";

export default async function PurchasingPage({
  searchParams,
}: {
  searchParams?: Promise<{ demandRun?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const dash = await loadPurchasingDashboard(dataUserId);
  const shortageReadiness = await evaluateInventoryShortageReadiness(dataUserId);
  const { rows, ordersConsidered, recipesLinked, productionItemsConsidered } = dash.demand;

  const runNote =
    sp.demandRun &&
    (await prisma.ingredientDemandRun.findFirst({
      where: { id: sp.demandRun, userId: dataUserId },
      select: { title: true },
    }));

  const bySupplier = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = r.supplier?.trim() || "Unassigned supplier";
    const list = bySupplier.get(key) ?? [];
    list.push(r);
    bySupplier.set(key, list);
  }

  const shortages = rows.filter((r) => r.shortage > 0);

  return (
    <div className="space-y-8">
      {runNote ? (
        <p className="rounded-lg border border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Linked demand run: <span className="font-medium text-foreground">{runNote.title}</span> — totals mirror the
          live ingredient demand engine.
        </p>
      ) : null}

      <PageHeader
        title="Purchasing"
        description={`Turn ingredient demand, shortages, par levels, and production plans into supplier-ready purchase orders. Live rollup: ${ordersConsidered} orders · ${productionItemsConsidered} production lines · ${recipesLinked} recipes.`}
      />

      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Inventory shortage readiness</CardTitle>
            <Badge variant="outline" className="rounded-full text-xs font-normal">
              {shortageReadiness.level.replace(/_/g, " ")}
            </Badge>
          </div>
          <CardDescription>
            {shortageReadiness.summary} Automatic <span className="font-medium text-foreground">INVENTORY_SHORTAGE</span>{" "}
            order blockers stay off until recipes, stock, demand runs, and thresholds are all in place — this card is
            readiness only, not a live shortage count.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center">
          <span>
            Recipes: <span className="font-medium text-foreground">{shortageReadiness.recipeCount}</span> · Stock rows:{" "}
            <span className="font-medium text-foreground">{shortageReadiness.ingredientsWithStockRows}</span> · Demand
            runs: <span className="font-medium text-foreground">{shortageReadiness.demandRuns}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/inventory/demand">Ingredient demand</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/purchasing/suppliers">Suppliers</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title="Open reorder items" value={String(dash.reorderOpenCount)} />
        <Kpi title="Draft POs" value={String(dash.draftPoCount)} />
        <Kpi title="POs awaiting approval" value={String(dash.awaitingApprovalCount)} />
        <Kpi title="Sent / partial POs" value={String(dash.sentPoCount)} />
        <Kpi title="Overdue (incl. derived)" value={String(dash.overduePoCount)} accent />
        <Kpi title="Est. open PO spend" value={`$${dash.estimatedOpenSpend.toFixed(2)}`} />
        <Kpi title="SKU-days short" value={String(shortages.length)} accent />
        <Kpi title="Suppliers on file" value={String(dash.suppliers.length)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next actions</CardTitle>
            <CardDescription>Human-in-the-loop — no silent ERP or email sends.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <form action={seedReorderFromDemandAction}>
              <Button type="submit" variant="default" className="rounded-full">
                Generate from demand
              </Button>
            </form>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/purchasing/purchase-orders">
                <Plus className="mr-2 h-4 w-4" />
                Create purchase order
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/purchasing/suppliers">
                <Truck className="mr-2 h-4 w-4" />
                Add supplier
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/purchasing/receiving">
                <Package className="mr-2 h-4 w-4" />
                Receive open PO
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/purchasing/price-history">Review price changes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reorder queue preview</CardTitle>
            <CardDescription>Earliest required-by lines (open).</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {dash.reorderSample.length === 0 ? (
              <p>No open reorder items — generate from demand or add manually (coming next).</p>
            ) : (
              <ul className="space-y-2">
                {dash.reorderSample.map((r) => (
                  <li key={r.id}>
                    <span className="font-medium text-foreground">{r.ingredientName}</span> ·{" "}
                    {r.suggested.toFixed(2)} {r.unit}{" "}
                    <Badge variant="outline" className="ml-1 rounded-full text-xs">
                      {r.urgency}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="link" className="mt-2 h-auto px-0">
              <Link href="/dashboard/purchasing/reorder-queue">Open reorder queue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {dash.ingredientsMissingSupplier > 0 ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          {dash.ingredientsMissingSupplier} ingredients have no legacy supplier label — assign suppliers so PO drafts
          group cleanly.
        </p>
      ) : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Recent purchase orders</CardTitle>
            <CardDescription>Statuses use your workflow — export/email remains manual.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/purchasing/purchase-orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {dash.recentPurchaseOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No purchase orders yet — create a draft or generate from demand.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">PO #</th>
                  <th className="pb-2 pr-4">Supplier</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {dash.recentPurchaseOrders.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="py-2 pr-4">
                      <Link href={`/dashboard/purchasing/purchase-orders/${p.id}`} className="font-medium underline-offset-4 hover:underline">
                        {p.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{p.supplierName}</td>
                    <td className="py-2 pr-4">{PURCHASE_ORDER_STATUS_LABELS[p.status]}</td>
                    <td className="py-2 text-right tabular-nums">${p.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Supplier rollups (demand)</CardTitle>
          <CardDescription>
            Still driven from ingredient supplier labels — first-class suppliers live under the Suppliers tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[...bySupplier.entries()].map(([supplier, lines]) => (
            <div key={supplier}>
              <p className="mb-2 font-medium">{supplier}</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {lines.slice(0, 12).map((l) => (
                  <li key={`${l.ingredientId}-${l.dateKey}`}>
                    {format(new Date(l.dateKey), "EEE MMM d")} · {l.name}:{" "}
                    <span className="font-medium text-foreground">
                      {l.required} {l.unit}
                    </span>{" "}
                    (stock {l.stock})
                  </li>
                ))}
              </ul>
              {lines.length > 12 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  +{lines.length - 12} more rows — export CSV from Ingredient demand.
                </p>
              ) : null}
            </div>
          ))}
          {rows.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No purchasing signals yet"
              description="Generate ingredient demand, add recipes, or create a manual reorder item to start building purchase orders."
              actionLabel="Generate ingredient demand"
              actionHref="/dashboard/inventory/demand"
            />
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Shortages</CardTitle>
            <CardDescription>Compared to current ingredient stock fields.</CardDescription>
          </div>
          <Badge variant={shortages.length ? "destructive" : "secondary"} className="rounded-full">
            {shortages.length} SKU-days
          </Badge>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {shortages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No modeled shortages — double-check physical counts before committing cash.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Ingredient</th>
                  <th className="pb-2 text-right">Short</th>
                  <th className="pb-2 pl-4">Unit</th>
                  <th className="pb-2 pl-4" />
                </tr>
              </thead>
              <tbody>
                {shortages.map((s) => (
                  <tr key={`${s.ingredientId}-${s.dateKey}`} className="border-b border-border/60">
                    <td className="py-2 pr-4">{format(new Date(s.dateKey), "MMM d")}</td>
                    <td className="py-2 pr-4">{s.name}</td>
                    <td className="py-2 text-right tabular-nums">{s.shortage}</td>
                    <td className="py-2 pl-4">{s.unit}</td>
                    <td className="py-2 pl-4">
                      <Button asChild variant="ghost" size="sm" className="h-8 rounded-full">
                        <Link href="/dashboard/purchasing/reorder-queue">Queue</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Detailed demand math and CSV also live on{" "}
        <Link href="/dashboard/inventory/demand" className="underline underline-offset-4">
          Ingredient demand
        </Link>
        .
      </p>
    </div>
  );
}

function Kpi({ title, value, accent }: { title: string; value: string; accent?: boolean }) {
  return (
    <Card className={accent ? "border-destructive/40" : "border-border/80"}>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className={`text-2xl font-semibold ${accent ? "text-destructive" : ""}`}>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
