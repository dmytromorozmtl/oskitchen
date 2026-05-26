import Link from "next/link";

import { BulkPricingTable } from "@/components/purchasing/bulk-pricing-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import {
  listBulkPriceAuditLog,
  listSupplierItemsForBulkEdit,
} from "@/services/purchasing/bulk-price-service";

export const dynamic = "force-dynamic";

export default async function BulkPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ supplierId?: string }>;
}) {
  const { supplierId } = await searchParams;
  const { dataUserId } = await getTenantActor();
  const [items, suppliers, audit] = await Promise.all([
    listSupplierItemsForBulkEdit(dataUserId, { supplierId }),
    prisma.supplier.findMany({
      where: { userId: dataUserId, active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    listBulkPriceAuditLog(dataUserId, 20),
  ]);

  const rows = items.map((i) => ({
    id: i.id,
    supplierName: i.supplier.name,
    ingredientName: i.ingredient.name,
    unitCost: Number(i.unitCost),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold">Bulk price editor</h1>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/purchasing/bulk-pricing"
          className={`rounded-full border px-3 py-1 text-sm ${!supplierId ? "bg-primary text-primary-foreground" : ""}`}
        >
          All
        </Link>
        {suppliers.map((s) => (
          <Link
            key={s.id}
            href={`?supplierId=${s.id}`}
            className={`rounded-full border px-3 py-1 text-sm ${supplierId === s.id ? "bg-primary text-primary-foreground" : ""}`}
          >
            {s.name}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supplier items — inline edit with audit log</CardTitle>
        </CardHeader>
        <CardContent>
          <BulkPricingTable items={rows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent audit log</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {audit.length === 0 ? (
            <p className="text-muted-foreground">No bulk price changes recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {audit.map((h) => (
                <li key={h.id} className="border-b py-2">
                  {h.supplierItem?.supplier.name ?? "—"} · {h.supplierItem?.ingredient.name ?? "—"}: $
                  {Number(h.oldUnitCost ?? 0).toFixed(4)} → ${Number(h.newUnitCost).toFixed(4)}
                  <span className="block text-xs text-muted-foreground">
                    {new Date(h.effectiveAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
