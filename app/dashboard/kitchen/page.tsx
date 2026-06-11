import { Suspense } from "react";

import { KDSSkeleton } from "@/components/dashboard/kds-skeleton";
import {
  KitchenDailyAsyncSection,
  KitchenStandardAsyncSection,
} from "@/components/dashboard/kitchen/kitchen-screen-async-sections";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { isKdsV1CertifiedRolloutEnabled } from "@/lib/kitchen/kds-v1-gate";
import { isDailyServiceMode } from "@/lib/operating-modes/resolver";
import { getTenantOperatingMode } from "@/lib/operating-modes/tenant-mode";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export default async function KitchenScreenPage({
  searchParams,
}: {
  searchParams?: Promise<{ station?: string; mode?: string; fullscreen?: string; card?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const actor = await requireWorkspacePermissionActor();
  const { sessionUser: session, dataUserId } = actor;

  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  const operatingMode = await getTenantOperatingMode(dataUserId);

  if (isDailyServiceMode(operatingMode)) {
    if (!isKdsV1CertifiedRolloutEnabled()) {
      return (
        <div className="mx-auto max-w-xl space-y-4 py-10">
          <PosAccessCard
            title="KDS v1 pilot"
            description="Daily-service kitchen display v1 is gated in non-production. Set ENABLE_KDS_V1_CERTIFIED=true to enable the certified ticket workflow in this environment."
            primaryHref="/dashboard/today"
            primaryLabel="Back to Today"
          />
        </div>
      );
    }

    return (
      <Suspense fallback={<KDSSkeleton />}>
        <KitchenDailyAsyncSection dataUserId={dataUserId} granted={actor.granted} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<KDSSkeleton />}>
      <KitchenStandardAsyncSection
        dataUserId={dataUserId}
        sessionUserId={session.id}
        sessionEmail={session.email ?? null}
        granted={actor.granted}
        searchParams={sp}
      />
    </Suspense>
  );
}
