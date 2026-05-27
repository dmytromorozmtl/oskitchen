import { Suspense } from "react";

import { KbHelpButton } from "@/components/dashboard/kb-help-button";
import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { KitchenScreenClient } from "@/components/dashboard/kitchen-screen-client";
import { KdsDailyService } from "@/components/kitchen/kds-daily-service";
import { isKdsV1CertifiedRolloutEnabled } from "@/lib/kitchen/kds-v1-gate";
import { isDailyServiceMode } from "@/lib/operating-modes/resolver";
import { getTenantOperatingMode } from "@/lib/operating-modes/tenant-mode";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";
import {
  normalizeKitchenCardSize,
  normalizeKitchenScreenMode,
  normalizeKitchenStationSlug,
} from "@/lib/kitchen-screen/kitchen-screen-filters";
import type { KitchenScreenMode } from "@/lib/kitchen-screen/kitchen-screen-types";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { loadKitchenScreenBundle } from "@/services/kitchen-screen/kitchen-screen-service";
import type { UserRole } from "@prisma/client";

export default async function KitchenScreenPage({
  searchParams,
}: {
  searchParams?: Promise<{ station?: string; mode?: string; fullscreen?: string; card?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const actor = await requireWorkspacePermissionActor();
  const { sessionUser: session, dataUserId } = actor;

  if (!hasPermission(actor.granted, "kitchen.view")) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-10">
        <PosAccessCard
          title="Kitchen display"
          description="You do not have permission to view kitchen display tickets in this workspace."
          primaryHref="/dashboard/today"
          primaryLabel="Back to Today"
        />
      </div>
    );
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

    const orders = await getDailyKdsOrders(dataUserId);
    return (
      <div className="p-4 md:p-6">
        <div className="mb-2 flex justify-end">
          <KbHelpButton articleSlug="kds" title="KDS Basics" description="Kitchen display setup and bump workflow." />
        </div>
        <KdsDailyService
          initialOrders={orders}
          userId={dataUserId}
          canBump={hasPermission(actor.granted, "kitchen.bump")}
          canRecall={hasPermission(actor.granted, "kitchen.recall")}
        />
      </div>
    );
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: {
      kitchenSettings: { select: { businessType: true } },
      role: true,
      email: true,
    },
  });

  const bundle = await loadKitchenScreenBundle({
    userId: dataUserId,
    sessionEmail: session.email ?? profile?.email ?? null,
    profileBusinessType: profile?.kitchenSettings?.businessType ?? null,
    userRole: (profile?.role ?? "OWNER") as UserRole,
  });

  const initialStation = normalizeKitchenStationSlug(sp.station);
  const initialMode: KitchenScreenMode = normalizeKitchenScreenMode(sp.mode);
  const initialFullscreen = sp.fullscreen === "1";
  const initialCardSize = normalizeKitchenCardSize(sp.card);

  const kitchenUiPermissions: Pick<
    Record<PermissionKey, boolean>,
    "kitchen.bump" | "kitchen.recall" | "kitchen.configure" | "kitchen.expo.manage"
  > = {
    "kitchen.bump": hasPermission(actor.granted, "kitchen.bump"),
    "kitchen.recall": hasPermission(actor.granted, "kitchen.recall"),
    "kitchen.configure": hasPermission(actor.granted, "kitchen.configure"),
    "kitchen.expo.manage": hasPermission(actor.granted, "kitchen.expo.manage"),
  };

  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading kitchen…</div>}>
      <KitchenScreenClient
        bundle={bundle}
        initialStation={initialStation}
        initialMode={initialMode}
        initialFullscreen={initialFullscreen}
        initialCardSize={initialCardSize}
        kitchenPermissions={kitchenUiPermissions}
      />
    </Suspense>
  );
}
