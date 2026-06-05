import type { Metadata } from "next";
import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { PosCashManagementClient } from "@/components/pos/pos-cash-management-client";
import { Button } from "@/components/ui/button";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { POS_CASH_MANAGEMENT_ROUTE } from "@/lib/pos/pos-cash-management";
import { loadPosCashManagementBootstrap } from "@/services/pos/pos-cash-management-service";

export const metadata: Metadata = {
  title: "POS Cash Management",
  description: "Open drawer, mid-shift counts, closeout, and printable cash reports.",
};

export default async function PosCashManagementPage({
  searchParams,
}: {
  searchParams?: Promise<{ step?: string }>;
}) {
  const actor = await requireWorkspacePermissionActor();
  const canOpen = hasPermission(actor.granted, "pos.shift.open");
  const canClose = hasPermission(actor.granted, "pos.shift.close");

  if (!hasPermission(actor.granted, "pos.access") || (!canOpen && !canClose)) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  const gate = await canUseFeature(actor.userId, "pos_shifts");
  if (!gate.allowed) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">POS Cash Management</h1>
        <p className="text-sm text-muted-foreground">
          Cash drawer open, count, close, and reports require Team plan shift tracking.
        </p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/billing">View plans</Link>
        </Button>
      </div>
    );
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const boot = await loadPosCashManagementBootstrap(actor.userId);

  if (boot.registers.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">POS Cash Management</h1>
        <p className="text-sm text-muted-foreground">Create a register before managing cash drawer floats.</p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/pos/registers">Add register</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">POS Cash Management</h1>
        <p className="text-sm text-muted-foreground">
          Open float, record mid-shift counts, close with variance, and print end-of-shift cash reports.
        </p>
      </div>
      <PosCashManagementClient
        registers={boot.registers}
        staff={boot.staff}
        openShifts={boot.openShifts}
        closedShifts={boot.closedShifts}
        recentCounts={boot.recentCounts}
        canOpen={canOpen}
        canClose={canClose}
        initialStep={resolvedSearchParams.step ?? null}
      />
      <p className="text-xs text-muted-foreground">
        Route: {POS_CASH_MANAGEMENT_ROUTE} · Advanced shift history also lives on{" "}
        <Link href="/dashboard/pos/shifts" className="text-primary underline-offset-2 hover:underline">
          POS shifts
        </Link>
        .
      </p>
    </div>
  );
}
