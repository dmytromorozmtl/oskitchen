import { AssignmentForm, type AssignmentRow } from "@/components/dashboard/locations/assignment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  getCachedMenuListWhere,
  getCachedOrderListWhere,
} from "@/lib/scope/cached-workspace-resource-scope";
import { brandListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function LocationAssignmentPage() {
  const { userId } = await getTenantActor();
  const [orderWhere, menuWhere] = await Promise.all([
    getCachedOrderListWhere(),
    getCachedMenuListWhere(),
  ]);
  const brandWhere = await brandListWhereForOwner(userId);
  const [locations, menus, orders, brands, productionBatches, packingBatches, routes, inventoryStocks, purchaseOrders, kitchenTasks, events] = await Promise.all([
    prisma.location.findMany({
      where: { userId, status: { not: "ARCHIVED" } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.menu.findMany({
      where: { AND: [menuWhere, { locationId: null }] },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true },
      take: 100,
    }),
    prisma.order.findMany({
      where: { AND: [orderWhere, { locationId: null }] },
      orderBy: { createdAt: "desc" },
      select: { id: true, customerName: true, status: true, createdAt: true },
      take: 100,
    }),
    prisma.brand.findMany({
      where: { AND: [brandWhere, { locationId: null }] },
      orderBy: { name: "asc" },
      select: { id: true, name: true, conceptKind: true },
      take: 100,
    }),
    prisma.productionBatch.findMany({
      where: { userId, locationId: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true },
      take: 100,
    }),
    prisma.packingBatch.findMany({
      where: { userId, locationId: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true },
      take: 100,
    }),
    prisma.deliveryRoute.findMany({
      where: { userId, locationId: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true },
      take: 100,
    }),
    prisma.inventoryStock.findMany({
      where: { userId, locationId: null },
      orderBy: { updatedAt: "desc" },
      include: { ingredient: { select: { name: true } } },
      take: 100,
    }),
    prisma.purchaseOrder.findMany({
      where: { userId, locationId: null },
      orderBy: { createdAt: "desc" },
      include: { supplier: { select: { name: true } } },
      take: 100,
    }),
    prisma.kitchenTask.findMany({
      where: { userId, locationId: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true },
      take: 100,
    }),
    prisma.locationAssignmentEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  const menuRows: AssignmentRow[] = menus.map((m) => ({
    id: m.id,
    label: m.title,
    hint: m.createdAt.toLocaleDateString(),
  }));
  const orderRows: AssignmentRow[] = orders.map((o) => ({
    id: o.id,
    label: `${o.customerName} · ${o.status}`,
    hint: o.createdAt.toLocaleDateString(),
  }));
  const brandRows: AssignmentRow[] = brands.map((b) => ({ id: b.id, label: b.name, hint: b.conceptKind }));
  const productionRows: AssignmentRow[] = productionBatches.map((b) => ({ id: b.id, label: b.title, hint: b.status }));
  const packingRows: AssignmentRow[] = packingBatches.map((b) => ({ id: b.id, label: b.title ?? b.id.slice(0, 8), hint: b.status }));
  const routeRows: AssignmentRow[] = routes.map((r) => ({ id: r.id, label: r.title ?? r.id.slice(0, 8), hint: r.status }));
  const inventoryRows: AssignmentRow[] = inventoryStocks.map((s) => ({
    id: s.id,
    label: s.ingredient?.name ?? s.id.slice(0, 8),
    hint: `${Number(s.quantityOnHand).toFixed(2)} ${s.unit}`,
  }));
  const poRows: AssignmentRow[] = purchaseOrders.map((p) => ({
    id: p.id,
    label: p.supplier?.name ?? p.id.slice(0, 8),
    hint: p.status,
  }));
  const taskRows: AssignmentRow[] = kitchenTasks.map((t) => ({ id: t.id, label: t.title, hint: t.status }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Assignment tools</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Tag unassigned rows to a location. Existing rows stay valid even if you skip this — assignment unlocks
          per-location filters, reports, and route start addresses.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <AssignmentForm target="MENU" title="Unassigned menus" description={`${menuRows.length} menu(s) waiting`} rows={menuRows} locations={locations} />
        <AssignmentForm target="ORDER" title="Unassigned orders" description={`${orderRows.length} order(s) waiting`} rows={orderRows} locations={locations} />
        <AssignmentForm target="BRAND" title="Unassigned brands" description={`${brandRows.length} brand(s) waiting`} rows={brandRows} locations={locations} />
        <AssignmentForm target="PRODUCTION_BATCH" title="Unassigned production batches" description={`${productionRows.length} batch(es) waiting`} rows={productionRows} locations={locations} />
        <AssignmentForm target="PACKING_BATCH" title="Unassigned packing batches" description={`${packingRows.length} batch(es) waiting`} rows={packingRows} locations={locations} />
        <AssignmentForm target="DELIVERY_ROUTE" title="Unassigned routes" description={`${routeRows.length} route(s) waiting`} rows={routeRows} locations={locations} />
        <AssignmentForm target="INVENTORY_STOCK" title="Unassigned inventory" description={`${inventoryRows.length} stock row(s) waiting`} rows={inventoryRows} locations={locations} />
        <AssignmentForm target="PURCHASE_ORDER" title="Unassigned POs" description={`${poRows.length} PO(s) waiting`} rows={poRows} locations={locations} />
        <AssignmentForm target="KITCHEN_TASK" title="Unassigned tasks" description={`${taskRows.length} task(s) waiting`} rows={taskRows} locations={locations} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent assignments</CardTitle>
          <CardDescription>Last 25 events across all locations.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignment events recorded yet.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {events.map((e) => (
                <li key={e.id} className="flex justify-between border-b border-border/40 py-1">
                  <span>
                    {e.target} · <code className="text-muted-foreground">{e.targetId.slice(0, 8)}</code>
                    {e.locationId ? "" : " · cleared"}
                  </span>
                  <span className="text-muted-foreground">{e.createdAt.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
