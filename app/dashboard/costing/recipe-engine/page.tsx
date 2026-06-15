import Link from "next/link";

import { RecipeCostingEnginePanel } from "@/components/inventory/recipe-costing-engine-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  RECIPE_COSTING_ENGINE_P2_97_COSTING_ROUTE,
  RECIPE_COSTING_ENGINE_P2_97_POLICY_ID,
} from "@/lib/inventory/recipe-costing-engine-p2-97-policy";
import { loadRecipeCostingEngineSnapshot } from "@/services/inventory/recipe-costing-engine-p2-97-service";

/** Blueprint P2-97 — recipe costing engine hub. */
export default async function RecipeCostingEnginePage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "reports.read.financial")) {
    return <PermissionDeniedSurfaceCard surfaceId="costing" />;
  }

  const snapshot = await loadRecipeCostingEngineSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recipe costing engine</h1>
          <p className="text-sm text-muted-foreground">
            Ingredient cost, yield, waste, portion cost, margin — policy {RECIPE_COSTING_ENGINE_P2_97_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={RECIPE_COSTING_ENGINE_P2_97_COSTING_ROUTE}>Costing overview</Link>
        </Button>
      </div>
      <RecipeCostingEnginePanel snapshot={snapshot} />
    </div>
  );
}
