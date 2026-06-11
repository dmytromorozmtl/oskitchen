import Link from "next/link";

import { AllergenTrackingPanel } from "@/components/inventory/allergen-tracking-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  ALLERGEN_TRACKING_P2_101_POLICY_ID,
  ALLERGEN_TRACKING_P2_101_PROFILES_ROUTE,
} from "@/lib/inventory/allergen-tracking-p2-101-policy";
import { loadAllergenTrackingSnapshot } from "@/services/inventory/allergen-tracking-p2-101-service";

/** Blueprint P2-101 — allergen tracking hub. */
export default async function AllergenTrackingPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "production.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="inventory" />;
  }

  const snapshot = await loadAllergenTrackingSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Allergen tracking</h1>
          <p className="text-sm text-muted-foreground">
            Registry, recipe rollup, inventory linkage — policy {ALLERGEN_TRACKING_P2_101_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={ALLERGEN_TRACKING_P2_101_PROFILES_ROUTE}>Menu allergen profiles</Link>
        </Button>
      </div>
      <AllergenTrackingPanel snapshot={snapshot} />
    </div>
  );
}
