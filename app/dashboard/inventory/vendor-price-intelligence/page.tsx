import Link from "next/link";

import { VendorPriceIntelligencePanel } from "@/components/inventory/vendor-price-intelligence-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { VENDOR_PRICE_CHANGE_ALERTS_P2_67_ROUTE } from "@/lib/inventory/vendor-price-change-alerts-p2-67-policy";
import {
  VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID,
  VENDOR_PRICE_INTELLIGENCE_P2_100_PURCHASING_ROUTE,
} from "@/lib/inventory/vendor-price-intelligence-p2-100-policy";
import { loadVendorPriceIntelligenceSnapshot } from "@/services/inventory/vendor-price-intelligence-p2-100-service";

/** Blueprint P2-100 — vendor price intelligence hub. */
export default async function VendorPriceIntelligencePage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "production.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="inventory" />;
  }

  const snapshot = await loadVendorPriceIntelligenceSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendor price intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Price history, substitutions, cheaper vendor — policy {VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={VENDOR_PRICE_CHANGE_ALERTS_P2_67_ROUTE}>Price alerts</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={VENDOR_PRICE_INTELLIGENCE_P2_100_PURCHASING_ROUTE}>Purchasing</Link>
          </Button>
        </div>
      </div>
      <VendorPriceIntelligencePanel snapshot={snapshot} />
    </div>
  );
}
