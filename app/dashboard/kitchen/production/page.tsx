import type { Metadata } from "next";
import Link from "next/link";

import { ProductionViewClient } from "@/components/kitchen/production-view-client";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { KDS_PRODUCTION_VIEW_ROUTE } from "@/lib/kitchen/kds-production-view-policy";
import { loadKdsProductionView } from "@/services/kitchen/production-view-service";

export const metadata: Metadata = {
  title: "KDS Production View",
  description: "Station load, bottlenecks, and kitchen ETA across active prep tickets.",
};

export default async function KdsProductionViewPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const snapshot = await loadKdsProductionView(actor.userId);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Production view</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Multi-station routing across 12 kitchen lines — load, bottlenecks, and estimated clear
            times for active prep tickets.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen">Back to KDS</Link>
        </Button>
      </div>

      <ProductionViewClient snapshot={snapshot} />

      <p className="sr-only">{KDS_PRODUCTION_VIEW_ROUTE}</p>
    </div>
  );
}
