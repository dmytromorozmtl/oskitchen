import Link from "next/link";

import { InventoryVarianceReportPanel } from "@/components/inventory/inventory-variance-report-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  INVENTORY_VARIANCE_REPORT_P2_99_MANAGER_ROUTE,
  INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID,
} from "@/lib/inventory/inventory-variance-report-p2-99-policy";
import { loadInventoryVarianceReportSnapshot } from "@/services/inventory/inventory-variance-report-p2-99-service";

/** Blueprint P2-99 — inventory variance report hub. */
export default async function InventoryVarianceReportPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "production.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="inventory" />;
  }

  const snapshot = await loadInventoryVarianceReportSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory variance report</h1>
          <p className="text-sm text-muted-foreground">
            Expected vs actual, theft/spoilage, waste — policy {INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={INVENTORY_VARIANCE_REPORT_P2_99_MANAGER_ROUTE}>AI Inventory Manager</Link>
        </Button>
      </div>
      <InventoryVarianceReportPanel snapshot={snapshot} />
    </div>
  );
}
