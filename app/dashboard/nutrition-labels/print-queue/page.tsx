import Link from "next/link";

import { markPrintedLabelJobFormAction } from "@/actions/label-print-queue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { printedLabelListWhereForOwner } from "@/lib/scope/workspace-printed-label-scope";
import { prisma } from "@/lib/prisma";

export default async function NutritionLabelPrintQueuePage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const rows = await prisma.printedLabel.findMany({
    where: await printedLabelListWhereForOwner(dataUserId),
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      template: { select: { name: true, size: true } },
      product: { select: { title: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <div>
        <Button asChild variant="ghost" className="mb-2 rounded-full px-0 text-muted-foreground">
          <Link href="/dashboard/nutrition-labels">← Label command center</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Print queue</h1>
        <p className="text-sm text-muted-foreground">Queued and completed label jobs for this workspace.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <CardDescription>Mark printed after your browser or OS print dialog completes.</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jobs yet — open an item to queue a template.</p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {rows.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-medium">{r.template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.product?.title ?? "—"} · {r.template.size} · copies {r.copies}
                    </p>
                    <Badge variant="outline" className="mt-1 rounded-full text-[10px]">
                      {r.status}
                    </Badge>
                  </div>
                  {r.status === "QUEUED" ? (
                    <form action={markPrintedLabelJobFormAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button type="submit" size="sm" className="rounded-full">
                        Mark printed
                      </Button>
                    </form>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {r.printedAt ? r.printedAt.toISOString() : ""}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
