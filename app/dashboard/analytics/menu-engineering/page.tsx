import Link from "next/link";

import { MenuEngineeringPanel } from "@/components/analytics/menu-engineering-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  MENU_ENGINEERING_P2_105_POLICY_ID,
  MENU_ENGINEERING_P2_105_REPORTS_ROUTE,
} from "@/lib/analytics/menu-engineering-p2-105-policy";
import { loadMenuEngineeringSnapshot } from "@/services/analytics/menu-engineering-p2-105-service";

/** Blueprint P2-105 — menu engineering analytics hub. */
export default async function AnalyticsMenuEngineeringPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "reports.read.financial")) {
    return <PermissionDeniedSurfaceCard surfaceId="analytics" />;
  }

  const snapshot = await loadMenuEngineeringSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Menu engineering</h1>
          <p className="text-sm text-muted-foreground">
            Stars / Plowhorses / Puzzles / Dogs matrix — policy {MENU_ENGINEERING_P2_105_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={MENU_ENGINEERING_P2_105_REPORTS_ROUTE}>Reports matrix</Link>
        </Button>
      </div>
      <MenuEngineeringPanel snapshot={snapshot} />
    </div>
  );
}
