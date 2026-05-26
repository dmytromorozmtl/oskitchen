import Link from "next/link";
import { notFound } from "next/navigation";

import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { listActivityForEntity } from "@/services/activity/activity-service";

export default async function ProductionBatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const { dataUserId } = await getTenantActor();

  const batch = await prisma.productionBatch.findFirst({
    where: { id: batchId, userId: dataUserId },
    include: {
      workItems: {
        take: 60,
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true, status: true, quantity: true },
      },
      order: { select: { id: true, customerName: true, status: true } },
    },
  });

  if (!batch) notFound();

  const activity = await listActivityForEntity(dataUserId, batch.id, 25);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{batch.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {batch.productionDate.toISOString().slice(0, 10)} · {batch.mode.replace(/_/g, " ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{batch.status}</Badge>
            <Badge variant="outline">
              {batch.completedItems}/{batch.totalItems} items
            </Badge>
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/production">All production</Link>
        </Button>
      </div>

      {batch.order ? (
        <Card>
          <CardHeader>
            <CardTitle>Linked order</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="font-medium">{batch.order.customerName}</p>
              <p className="text-muted-foreground">{batch.order.status}</p>
            </div>
            <Button asChild variant="secondary" className="rounded-full">
              <Link href={`/dashboard/orders/${batch.order.id}`}>Open order</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Work items</CardTitle>
          <CardDescription>Line-level production work.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 pr-2">Title</th>
                <th className="py-2 pr-2">Qty</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {batch.workItems.map((w) => (
                <tr key={w.id} className="border-b border-border/60">
                  <td className="py-2 pr-2 font-medium">{w.title}</td>
                  <td className="py-2 pr-2 tabular-nums">{w.quantity}</td>
                  <td className="py-2">{w.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ActivityTimeline items={activity} />
    </div>
  );
}
