import type { Metadata } from "next";
import Link from "next/link";

import { KdsDriverEtaScreen } from "@/components/kitchen/kds-driver-eta-screen";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { KDS_DRIVER_ETA_TRACKING_ROUTE } from "@/lib/kitchen/kds-driver-eta-tracking-absolute-final-policy";
import { loadKdsDriverEtaTrackingModel } from "@/services/kitchen/kds-driver-eta-tracking-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export const metadata: Metadata = {
  title: "Driver ETA tracking",
  description: "KDS delivery driver ETA board — dispatch status and estimated arrival.",
};

export default function KdsDriverEtaPage() {
  return (
    <SuspenseWave1PageBoundary sector="kitchen">
      <KdsDriverEtaPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function KdsDriverEtaPageAsync() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const model = await loadKdsDriverEtaTrackingModel(actor.userId);

  return (
    <div className="space-y-6 p-4 md:p-6 landscape:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kitchen · Driver ETA
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Driver ETA tracking in KDS
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            estimated ETA from dispatch status and GPS pings for active delivery tickets. BETA — not
            live GPS certified. Do not claim third-party courier accuracy.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen/expo">Expo view</Link>
        </Button>
      </div>

      <KdsDriverEtaScreen model={model} />

      <p className="sr-only">{KDS_DRIVER_ETA_TRACKING_ROUTE}</p>
    </div>
  );
}
