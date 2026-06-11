import { Suspense } from "react";

import { PosOverviewAsyncSection } from "@/components/dashboard/pos/pos-overview-async-section";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { POSSkeleton } from "@/components/dashboard/pos-skeleton";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export default async function PosOverviewPage() {
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">POS Terminal</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Front-of-house sales that create real OS Kitchen orders with <code className="text-xs">creationSource = POS</code>,
          production routing, inventory impact events, and audit trails.
        </p>
      </div>

      <Suspense fallback={<POSSkeleton />}>
        <PosOverviewAsyncSection userId={userId} />
      </Suspense>
    </div>
  );
}
