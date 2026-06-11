import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getCachedOrderListWhere } from "@/lib/scope/cached-workspace-order-scope";
import { prisma } from "@/lib/prisma";

export default async function LocationOrdersPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await prisma.location.findFirst({ where: { id: locationId, userId } });
  if (!loc) notFound();
  const orderWhere = await getCachedOrderListWhere();
  const orders = await prisma.order.findMany({
    where: { AND: [orderWhere, { locationId: loc.id }] },
    orderBy: { createdAt: "desc" },
    select: { id: true, customerName: true, status: true, total: true, createdAt: true },
    take: 50,
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-base font-semibold">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No orders yet for this location.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border/70">
                  <th className="py-2 pr-2">Order</th>
                  <th className="py-2 pr-2">Customer</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2 text-right">Total</th>
                  <th className="py-2 pr-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border/40">
                    <td className="py-2 pr-2">
                      <Link href={`/dashboard/orders/${o.id}`} className="font-medium hover:underline">
                        {o.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="py-2 pr-2">{o.customerName}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{o.status}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">
                      {o.total != null ? Number(o.total).toFixed(2) : "—"}
                    </td>
                    <td className="py-2 pr-2 text-muted-foreground">{o.createdAt.toLocaleDateString()}</td>
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
