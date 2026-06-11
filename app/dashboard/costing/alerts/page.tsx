import Link from "next/link";

import { PlanGate } from "@/components/plans/plan-gate";
import { Badge } from "@/components/ui/badge";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function CostingAlertsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const latestRun = await prisma.costingRun.findFirst({
    where: { userId: dataUserId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });
  const lines = latestRun
    ? await prisma.profitabilityLine.findMany({
        where: { runId: latestRun.id, warningLevel: { not: "NONE" } },
        orderBy: { grossMarginPercent: "asc" },
        take: 200,
      })
    : [];

  return (
    <PlanGate userId={dataUserId} feature="costing" title="Margin alerts">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Margin alerts</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Rows from the latest costing run that raised a warning (margin vs. targets, food cost %, or missing data
            flags).
          </p>
        </div>
        <ul className="divide-y rounded-lg border border-border/80 text-sm">
          {lines.map((l) => (
            <li key={l.id} className="flex flex-wrap items-start justify-between gap-2 px-3 py-3">
              <div>
                <div className="font-medium">{l.itemTitle}</div>
                <div className="text-muted-foreground">
                  Margin {Number(l.grossMarginPercent).toFixed(1)}% · food cost {Number(l.foodCostPercent).toFixed(1)}%
                </div>
              </div>
              <Badge variant="destructive" className="rounded-full">
                {l.warningLevel}
              </Badge>
            </li>
          ))}
          {lines.length === 0 ? (
            <li className="px-3 py-8 text-center text-muted-foreground">
              No alerts — or run costing from{" "}
              <Link className="underline underline-offset-4" href="/dashboard/costing">
                overview
              </Link>
              .
            </li>
          ) : null}
        </ul>
      </div>
    </PlanGate>
  );
}
