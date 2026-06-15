import Link from "next/link";

import { SalesByStaffPanel } from "@/components/analytics/sales-by-staff-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  SALES_BY_STAFF_P2_112_POLICY_ID,
  SALES_BY_STAFF_P2_112_POS_ROUTE,
} from "@/lib/analytics/sales-by-staff-p2-112-policy";
import { loadSalesByStaffSnapshot } from "@/services/analytics/sales-by-staff-p2-112-service";

/** Blueprint P2-112 — sales-by-staff analytics hub. */
export default async function SalesByStaffAnalyticsPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "reports.read.financial")) {
    return <PermissionDeniedSurfaceCard surfaceId="analytics" />;
  }

  const snapshot = await loadSalesByStaffSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales by staff</h1>
          <p className="text-sm text-muted-foreground">
            Server sales · avg check per shift · leaderboard — policy {SALES_BY_STAFF_P2_112_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={SALES_BY_STAFF_P2_112_POS_ROUTE}>POS terminal</Link>
        </Button>
      </div>
      <SalesByStaffPanel snapshot={snapshot} />
    </div>
  );
}
