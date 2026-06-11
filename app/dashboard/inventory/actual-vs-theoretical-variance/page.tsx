import Link from "next/link";

import { ActualVsTheoreticalVariancePanel } from "@/components/inventory/actual-vs-theoretical-variance-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_AVT_ROUTE,
  ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID,
} from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-policy";
import { loadActualVsTheoreticalVarianceSnapshot } from "@/services/inventory/actual-vs-theoretical-variance-p2-102-service";

/** Blueprint P2-102 — actual vs theoretical variance dashboard tile hub. */
export default async function ActualVsTheoreticalVariancePage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "production.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="inventory" />;
  }

  const snapshot = await loadActualVsTheoreticalVarianceSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Actual vs theoretical variance</h1>
          <p className="text-sm text-muted-foreground">
            Dashboard tile, theoretical baseline, actual depletion — policy{" "}
            {ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_AVT_ROUTE}>Full AVT report</Link>
        </Button>
      </div>
      <ActualVsTheoreticalVariancePanel snapshot={snapshot} />
    </div>
  );
}
