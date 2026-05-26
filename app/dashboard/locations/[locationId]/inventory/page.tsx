import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function LocationInventoryPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await prisma.location.findFirst({ where: { id: locationId, userId } });
  if (!loc) notFound();

  const stocks = await prisma.inventoryStock.findMany({
    where: { userId, locationId: loc.id },
    orderBy: { updatedAt: "desc" },
    take: 80,
    include: { ingredient: { select: { name: true } } },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-base font-semibold">Inventory stock</h2>
        {stocks.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No inventory rows assigned to this location yet.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border/70">
                  <th className="py-2 pr-2">Ingredient</th>
                  <th className="py-2 pr-2 text-right">On hand</th>
                  <th className="py-2 pr-2">Unit</th>
                  <th className="py-2 pr-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => (
                  <tr key={s.id} className={`border-b border-border/40 ${Number(s.quantityOnHand) <= 0 ? "bg-destructive/10" : ""}`}>
                    <td className="py-2 pr-2 font-medium">{s.ingredient?.name ?? s.ingredientId.slice(0, 8)}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">{Number(s.quantityOnHand).toFixed(2)}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{s.unit}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{s.updatedAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
