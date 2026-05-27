import { Suspense } from "react";

import { KbHelpButton } from "@/components/dashboard/kb-help-button";
import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { KitchenScreenClient } from "@/components/dashboard/kitchen-screen-client";
import { KdsDailyService } from "@/components/kitchen/kds-daily-service";
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
    const orders = await getDailyKdsOrders(dataUserId);
    return (
      <div className="p-4 md:p-6">
        <div className="mb-2 flex justify-end">
          <KbHelpButton articleSlug="kds" title="KDS Basics" description="Kitchen display setup and bump workflow." />
        </div>
        <KdsDailyService initialOrders={orders} userId={dataUserId} />
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

  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading kitchen…</div>}>
      <KitchenScreenClient
        bundle={bundle}
        initialStation={initialStation}
        initialMode={initialMode}
        initialFullscreen={initialFullscreen}
        initialCardSize={initialCardSize}
      />
    </Suspense>
  );
}
