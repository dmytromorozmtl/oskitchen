import Link from "next/link";

import { CommissionFreeOrderingPanel } from "@/components/marketing/commission-free-ordering-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  COMMISSION_FREE_ORDERING_P2_113_POLICY_ID,
  COMMISSION_FREE_ORDERING_P2_113_STOREFRONT_ROUTE,
} from "@/lib/marketing/commission-free-ordering-p2-113-policy";
import { loadCommissionFreeOrderingSnapshot } from "@/services/marketing/commission-free-ordering-p2-113-service";

/** Blueprint P2-113 — commission-free ordering messaging hub. */
export default async function CommissionFreeOrderingPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "storefront.read")) {
    return <PermissionDeniedSurfaceCard surfaceId="storefront" />;
  }

  const snapshot = await loadCommissionFreeOrderingSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Commission-free ordering</h1>
          <p className="text-sm text-muted-foreground">
            Storefront + Stripe messaging — policy {COMMISSION_FREE_ORDERING_P2_113_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={COMMISSION_FREE_ORDERING_P2_113_STOREFRONT_ROUTE}>Storefront ordering</Link>
        </Button>
      </div>
      <CommissionFreeOrderingPanel snapshot={snapshot} />
    </div>
  );
}
