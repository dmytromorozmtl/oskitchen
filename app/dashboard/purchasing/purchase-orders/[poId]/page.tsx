import Link from "next/link";
import { format } from "date-fns";

import { PageHeader } from "@/components/layout/page-header";
import { POApprovalButtons } from "@/components/purchasing/po-approval-buttons";
import { getPurchaseOrderApprovalStatus } from "@/services/purchasing/purchase-order-approval-rules";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ poId: string }> }) {
  const { poId } = await params;
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const po = await prisma.purchaseOrder.findFirst({
    where: { id: poId, userId: dataUserId },
    include: {
      supplier: true,
      lines: { include: { ingredient: { select: { name: true } } } },
      approvalEvents: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  const approvalStatus = po
    ? await getPurchaseOrderApprovalStatus(po.id, Number(po.total))
    : null;

  if (!po) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">Purchase order not found.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={po.orderNumber}
        description={`${po.supplier.name} · ${po.status.replace(/_/g, " ").toLowerCase()}`}
      />
      {approvalStatus ? (
        <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
          <p>
            Approvals: {approvalStatus.approvals} / {approvalStatus.rule.requiredApprovers} required
            {approvalStatus.remaining > 0 ? ` (${approvalStatus.remaining} remaining)` : " — complete"}
          </p>
          {approvalStatus.approvedBy.length > 0 ? (
            <p className="text-muted-foreground text-xs mt-1">
              Approved by: {approvalStatus.approvedBy.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
      <POApprovalButtons poId={po.id} status={po.status} />
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/dashboard/purchasing/purchase-orders" className="text-muted-foreground underline underline-offset-4">
          ← All purchase orders
        </Link>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground">Subtotal</p>
              <p className="text-lg font-semibold">${Number(po.subtotal).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tax / shipping</p>
              <p className="text-lg font-semibold">
                ${Number(po.tax).toFixed(2)} / ${Number(po.shipping).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">${Number(po.total).toFixed(2)}</p>
            </div>
          </div>
          {po.notes ? <p className="text-sm text-muted-foreground">{po.notes}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Lines</h2>
          {po.lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lines yet — add from reorder queue or ingredient demand (workflow extension).</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">Ingredient</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2">Unit</th>
                  <th className="pb-2 text-right">Received</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {po.lines.map((l) => (
                  <tr key={l.id} className="border-b border-border/60">
                    <td className="py-2">{l.ingredient.name}</td>
                    <td className="py-2 text-right tabular-nums">{Number(l.quantity)}</td>
                    <td className="py-2">{l.unit}</td>
                    <td className="py-2 text-right tabular-nums">{Number(l.receivedQuantity)}</td>
                    <td className="py-2">
                      <Badge variant="outline" className="rounded-full text-xs">
                        {l.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Activity</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {po.approvalEvents.map((e) => (
              <li key={e.id}>
                <span className="font-medium text-foreground">{e.action}</span> · {format(e.createdAt, "MMM d, yyyy HH:mm")}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
