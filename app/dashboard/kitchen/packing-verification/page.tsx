import Link from "next/link";

import { PackingVerificationPanel } from "@/components/kitchen/packing-verification-panel";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { PACKING_VERIFICATION_P2_94_POLICY_ID } from "@/lib/kitchen/packing-verification-p2-94-policy";
import { loadPackingVerificationSnapshot } from "@/services/kitchen/packing-verification-p2-94-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-94 — packing verification hub (KDS). */
export default function KitchenPackingVerificationPage() {
  return (
    <SuspenseWave1PageBoundary sector="kitchen">
      <KitchenPackingVerificationPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function KitchenPackingVerificationPageAsync() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const snapshot = await loadPackingVerificationSnapshot(actor.userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Packing verification</h1>
          <p className="text-sm text-muted-foreground">
            QR scan, allergens, delivery bag — policy {PACKING_VERIFICATION_P2_94_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/packing/scanner">Open scanner</Link>
        </Button>
      </div>
      <PackingVerificationPanel snapshot={snapshot} />
    </div>
  );
}
