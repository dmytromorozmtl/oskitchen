import { format } from "date-fns";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function ReceivingPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const events = await prisma.receivingEvent.findMany({
    where: { purchaseOrder: { userId: dataUserId } },
    orderBy: { receivedAt: "desc" },
    take: 80,
    include: { purchaseOrder: { select: { orderNumber: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Receiving"
        description="Receiving events are append-only audit rows. Stock updates from receiving will be wired with explicit confirmations — never silent writes."
      />
      <Card>
        <CardHeader>
          <CardTitle>Recent receipts</CardTitle>
          <CardDescription>Log receipts against PO lines in a future step; this list shows persisted events only.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No receiving events yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex flex-wrap justify-between gap-2 border-b border-border/60 py-2">
                  <span className="font-mono text-xs text-muted-foreground">{e.purchaseOrder.orderNumber}</span>
                  <span>
                    {Number(e.receivedQuantity)} {e.unit}
                  </span>
                  <span className="text-muted-foreground">{format(e.receivedAt, "MMM d, yyyy HH:mm")}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
