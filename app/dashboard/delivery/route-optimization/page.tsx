import Link from "next/link";

import { RouteOptimizationPanel } from "@/components/delivery/route-optimization-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  ROUTE_OPTIMIZATION_P2_114_OPTIMIZE_ROUTE,
  ROUTE_OPTIMIZATION_P2_114_POLICY_ID,
} from "@/lib/delivery/route-optimization-p2-114-policy";
import { loadRouteOptimizationSnapshot } from "@/services/delivery/route-optimization-p2-114-service";

/** Blueprint P2-114 — route optimization engine hub. */
export default async function RouteOptimizationPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "routes.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="routes" />;
  }

  const snapshot = await loadRouteOptimizationSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Route optimization</h1>
          <p className="text-sm text-muted-foreground">
            Driver delivery routing — policy {ROUTE_OPTIMIZATION_P2_114_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={ROUTE_OPTIMIZATION_P2_114_OPTIMIZE_ROUTE}>Dispatch optimize</Link>
        </Button>
      </div>
      <RouteOptimizationPanel snapshot={snapshot} />
    </div>
  );
}
