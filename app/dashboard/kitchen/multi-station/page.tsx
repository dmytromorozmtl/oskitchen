import Link from "next/link";

import { MultiStationKdsPanel } from "@/components/kitchen/multi-station-kds-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { MULTI_STATION_KDS_POLICY_ID } from "@/lib/kitchen/multi-station-kds-p2-90-policy";
import { loadMultiStationKdsPilotSnapshot } from "@/services/kitchen/multi-station-kds-p2-90-service";

/** Blueprint P2-90 — multi-station KDS hub. */
export default async function MultiStationKdsPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const snapshot = await loadMultiStationKdsPilotSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Multi-station KDS</h1>
          <p className="text-sm text-muted-foreground">
            Six core stations — policy {MULTI_STATION_KDS_POLICY_ID} · upstream{" "}
            {snapshot.upstreamPolicyId}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen">Open KDS</Link>
        </Button>
      </div>
      <MultiStationKdsPanel snapshot={snapshot} />
    </div>
  );
}
