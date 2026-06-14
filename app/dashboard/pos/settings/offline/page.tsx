import Link from "next/link";

import { PosOfflineFullModePanel } from "@/components/pos/pos-offline-full-mode-panel";
import { PosOfflineModeV1Panel } from "@/components/pos/pos-offline-mode-v1-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { OFFLINE_POS_FULL_MODE_P1_31_POLICY_ID } from "@/lib/pos/offline-pos-full-mode-p1-31-policy";
import { POS_OFFLINE_MODE_V1_POLICY_ID } from "@/lib/pos/pos-offline-mode-v1-policy";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-88 — POS offline mode v1.0 settings surface. */
export default function PosOfflineSettingsPage() {
  return (
    <SuspenseWave1PageBoundary sector="pos">
      <PosOfflineSettingsPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function PosOfflineSettingsPageAsync() {
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
            Full mode ({OFFLINE_POS_FULL_MODE_P1_31_POLICY_ID}) — menu cache, sync queue, PCI
            noop-v1 review. v1.0 ({POS_OFFLINE_MODE_V1_POLICY_ID}) — local cart and audit log.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/pos/terminal">Open POS terminal</Link>
        </Button>
      </div>
      <PosOfflineFullModePanel />
      <PosOfflineModeV1Panel />
    </div>
  );
}
