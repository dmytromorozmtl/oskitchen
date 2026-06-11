import Link from "next/link";

import { SupplierPriceHistoryPanel } from "@/components/inventory/supplier-price-history-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID,
  SUPPLIER_PRICE_HISTORY_P2_103_PURCHASING_ROUTE,
} from "@/lib/inventory/supplier-price-history-p2-103-policy";
import { loadSupplierPriceHistorySnapshot } from "@/services/inventory/supplier-price-history-p2-103-service";

/** Blueprint P2-103 — supplier price history per ingredient graph hub. */
export default async function SupplierPriceHistoryPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "production.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="inventory" />;
  }

  const snapshot = await loadSupplierPriceHistorySnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Supplier price history</h1>
          <p className="text-sm text-muted-foreground">
            Per-ingredient graphs, multi-supplier trends, change summary — policy{" "}
            {SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={SUPPLIER_PRICE_HISTORY_P2_103_PURCHASING_ROUTE}>Purchasing</Link>
        </Button>
      </div>
      <SupplierPriceHistoryPanel snapshot={snapshot} />
    </div>
  );
}
