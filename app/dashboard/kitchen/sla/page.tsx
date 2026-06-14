import Link from "next/link";

import { KitchenSlaTimersPanel } from "@/components/kitchen/kitchen-sla-timers-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { KITCHEN_SLA_TIMERS_POLICY_ID } from "@/lib/kitchen/kitchen-sla-timers-p2-92-policy";
import { loadKitchenSlaTimersSnapshot } from "@/services/kitchen/kitchen-sla-timers-p2-92-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-92 — kitchen SLA timers hub. */
export default function KitchenSlaTimersPage() {
  return (
    <SuspenseWave1PageBoundary sector="kitchen">
      <KitchenSlaTimersPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function KitchenSlaTimersPageAsync() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const snapshot = await loadKitchenSlaTimersSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kitchen SLA</h1>
          <p className="text-sm text-muted-foreground">
            Rush-hour timers — policy {KITCHEN_SLA_TIMERS_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen">Open KDS</Link>
        </Button>
      </div>
      <KitchenSlaTimersPanel snapshot={snapshot} />
    </div>
  );
}
