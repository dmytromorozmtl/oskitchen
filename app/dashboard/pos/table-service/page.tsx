import Link from "next/link";

import { TableServiceDepthPanel } from "@/components/pos/table-service-depth-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { TABLE_SERVICE_DEPTH_POLICY_ID } from "@/lib/pos/table-service-depth-policy";

/** Blueprint P2-89 — table service depth hub. */
export default async function PosTableServicePage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Table service</h1>
          <p className="text-sm text-muted-foreground">
            Split bills, merge tables, transfer seats, bar mode, server banking, tips reconciliation — policy{" "}
            {TABLE_SERVICE_DEPTH_POLICY_ID}.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/pos/tabs">Open tabs</Link>
        </Button>
      </div>
      <TableServiceDepthPanel />
    </div>
  );
}
