import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  hasPackingManagePageAccess,
  loadWorkspacePermissionPageActor,
  resolvePackingDeniedSurfaceId,
} from "@/lib/ux/permission-denied-page-access-era19";
import { prisma } from "@/lib/prisma";

export default async function PackingReportsPage() {
  const actor = await loadWorkspacePermissionPageActor();

  if (!hasPackingManagePageAccess(actor)) {
    return (
      <PermissionDeniedSurfaceCard surfaceId={resolvePackingDeniedSurfaceId("reports")} />
    );
  }

  const { sessionUser: session, dataUserId } = actor;
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const [packedLines, printedHints, verifyEvents] = await Promise.all([
    prisma.packingTask.count({
      where: {
        userId: dataUserId,
        status: { in: ["PACKED", "VERIFIED"] },
        updatedAt: { gte: since },
      },
    }),
    prisma.packingTask.count({
      where: {
        userId: dataUserId,
        labelPrintedAt: { not: null },
        updatedAt: { gte: since },
      },
    }),
    prisma.packingVerificationEvent.count({
      where: {
        order: { userId: dataUserId },
        createdAt: { gte: since },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Packing reports</h1>
        <p className="mt-2 text-muted-foreground">
          Rolling two-week snapshot from packing tasks and verification events. Deeper breakdowns will extend this view.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Packed / verified lines</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{packedLines}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Label print logs</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{printedHints}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Verification events</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{verifyEvents}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Next metrics</CardTitle>
          <CardDescription>
            Missing-item rate, average pack time, and per-staff throughput require additional instrumentation — tracked
            as follow-up work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/packing">Back to packing command center</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
