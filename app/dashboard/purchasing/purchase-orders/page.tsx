import Link from "next/link";

import { createDraftPurchaseOrderAction } from "@/app/dashboard/purchasing/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { PURCHASE_ORDER_STATUS_LABELS } from "@/lib/purchasing/purchasing-status";
import { prisma } from "@/lib/prisma";

export default async function PurchaseOrdersPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const [orders, suppliers] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: { userId: dataUserId },
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: { supplier: { select: { name: true } } },
    }),
    prisma.supplier.findMany({
      where: { userId: dataUserId, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Purchase orders"
        description="Create drafts, route for approval, export or copy to email — ERP integrations stay manual until explicitly built."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New draft PO</CardTitle>
          <CardDescription>Pick a supplier record — lines can be edited on the PO detail screen.</CardDescription>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a supplier first.{" "}
              <Link href="/dashboard/purchasing/suppliers" className="underline underline-offset-4">
                Open suppliers
              </Link>
              .
            </p>
          ) : (
            <form action={createDraftPurchaseOrderAction} className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-muted-foreground">Supplier</span>
                <select
                  name="supplierId"
                  required
                  className="flex h-10 min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit" className="rounded-full">
                Create draft PO
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All purchase orders</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No purchase orders yet.</p>
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
                {orders.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="py-2 pr-4">
                      <Link href={`/dashboard/purchasing/purchase-orders/${p.id}`} className="font-medium underline-offset-4 hover:underline">
                        {p.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{p.supplier.name}</td>
                    <td className="py-2 pr-4">{PURCHASE_ORDER_STATUS_LABELS[p.status]}</td>
                    <td className="py-2 text-right tabular-nums">${Number(p.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
