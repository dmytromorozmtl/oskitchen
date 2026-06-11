import Link from "next/link";

import { PurchaseSuggestionsPanel } from "@/components/inventory/purchase-suggestions-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  PURCHASE_SUGGESTIONS_P2_98_POLICY_ID,
  PURCHASE_SUGGESTIONS_P2_98_PURCHASING_AI_ROUTE,
} from "@/lib/inventory/purchase-suggestions-p2-98-policy";
import { loadPurchaseSuggestionsSnapshot } from "@/services/inventory/purchase-suggestions-p2-98-service";

/** Blueprint P2-98 — purchase suggestions AI hub. */
export default async function PurchaseSuggestionsPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "production.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="inventory" />;
  }

  const snapshot = await loadPurchaseSuggestionsSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purchase suggestions</h1>
          <p className="text-sm text-muted-foreground">
            Forecast, low stock, menu demand, vendor price — policy {PURCHASE_SUGGESTIONS_P2_98_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={PURCHASE_SUGGESTIONS_P2_98_PURCHASING_AI_ROUTE}>AI Purchasing</Link>
        </Button>
      </div>
      <PurchaseSuggestionsPanel snapshot={snapshot} />
    </div>
  );
}
