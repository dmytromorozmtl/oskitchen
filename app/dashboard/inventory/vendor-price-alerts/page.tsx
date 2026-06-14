import { VendorPriceChangeAlertsPanel } from "@/components/inventory/vendor-price-change-alerts-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID } from "@/lib/inventory/vendor-price-change-alerts-p2-67-policy";
import { loadVendorPriceChangeAlertsSnapshot } from "@/services/inventory/vendor-price-change-alerts-p2-67-service";

/** P2-67 — vendor price change alerts (MarginEdge parity). */
export default async function VendorPriceAlertsPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "production.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="inventory" />;
  }

  const snapshot = await loadVendorPriceChangeAlertsSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vendor price change alerts</h1>
        <p className="text-sm text-muted-foreground">
          MarginEdge parity — auto-alerts when supplier unit costs change beyond threshold. Policy{" "}
          {VENDOR_PRICE_CHANGE_ALERTS_P2_67_POLICY_ID}
        </p>
      </div>
      <VendorPriceChangeAlertsPanel snapshot={snapshot} />
    </div>
  );
}
