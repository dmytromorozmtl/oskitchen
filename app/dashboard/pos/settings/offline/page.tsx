import Link from "next/link";

import { PosOfflineModeV1Panel } from "@/components/pos/pos-offline-mode-v1-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { POS_OFFLINE_MODE_V1_POLICY_ID } from "@/lib/pos/pos-offline-mode-v1-policy";

/** Blueprint P2-88 — POS offline mode v1.0 settings surface. */
export default async function PosOfflineSettingsPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.hardware.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Offline mode</h1>
          <p className="text-sm text-muted-foreground">
            v1.0 — local cart, sync queue, conflict resolution, and audit log. Policy {POS_OFFLINE_MODE_V1_POLICY_ID}.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/pos/terminal">Open POS terminal</Link>
        </Button>
      </div>
      <PosOfflineModeV1Panel />
    </div>
  );
}
