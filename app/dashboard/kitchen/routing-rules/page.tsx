import Link from "next/link";

import { KdsStationRoutingRulesPanel } from "@/components/dashboard/kitchen/kds-station-routing-rules-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { loadKdsStationRoutingRulesModel } from "@/services/kitchen/kds-station-routing-rules-service";

export default async function KdsStationRoutingRulesPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const model = await loadKdsStationRoutingRulesModel(actor.userId);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">KDS station routing rules</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            NCR Aloha-parity routing — product, category, keyword, and default rules assign tickets
            to grill, fry, expo, and 9 other kitchen lines.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen">Back to KDS</Link>
        </Button>
      </div>

      <KdsStationRoutingRulesPanel model={model} />
    </div>
  );
}
