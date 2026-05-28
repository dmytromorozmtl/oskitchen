import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  hasProductionManagePageAccess,
  loadWorkspacePermissionPageActor,
  resolveProductionDeniedSurfaceId,
} from "@/lib/ux/permission-denied-page-access-era19";
import { prisma } from "@/lib/prisma";

export default async function ProductionReportsPage() {
  const actor = await loadWorkspacePermissionPageActor();

  if (!hasProductionManagePageAccess(actor)) {
    return (
      <PermissionDeniedSurfaceCard surfaceId={resolveProductionDeniedSurfaceId("reports")} />
    );
  }

  const { sessionUser: user, dataUserId } = actor;

  const [workDone, workOpen] = await Promise.all([
    prisma.productionWorkItem.count({
      where: { userId: dataUserId, status: "DONE" },
    }),
    prisma.productionWorkItem.count({
      where: { userId: dataUserId, status: { notIn: ["DONE", "CANCELLED"] } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Production
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-2 text-muted-foreground">
            High-level counts from command-center work items. Detailed charts (station load over time,
            estimate vs actual) will aggregate from `ProductionWorkEvent` and batch metrics.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/production">Back to command center</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completed work items (all time)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{workDone}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open work items</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{workOpen}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next analytics slices</CardTitle>
          <CardDescription>
            Late tasks, station workload, packing handoff rate, and brand/location splits will query
            indexed fields on `ProductionWorkItem` and `ProductionBatch`.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
