import { KdsKitchenDailyClient } from "@/app/dashboard/kitchen/kds-kitchen-daily-client";
import { KbHelpButton } from "@/components/dashboard/kb-help-button";
import { KitchenScreenClient } from "@/components/dashboard/kitchen-screen-client";
import {
  normalizeKitchenCardSize,
  normalizeKitchenScreenMode,
  normalizeKitchenStationSlug,
} from "@/lib/kitchen-screen/kitchen-screen-filters";
import type { KitchenScreenMode } from "@/lib/kitchen-screen/kitchen-screen-types";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { prisma } from "@/lib/prisma";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";
import { loadKitchenScreenBundle } from "@/services/kitchen-screen/kitchen-screen-service";
import type { UserRole } from "@prisma/client";

type KitchenGranted = Pick<
  Record<PermissionKey, boolean>,
  "kitchen.bump" | "kitchen.recall" | "kitchen.configure" | "kitchen.expo.manage"
>;

export async function KitchenDailyAsyncSection({
  dataUserId,
  granted,
}: {
  dataUserId: string;
  granted: ReadonlySet<PermissionKey>;
}) {
  const orders = await getDailyKdsOrders(dataUserId);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-2 flex justify-end">
        <KbHelpButton articleSlug="kds" title="KDS Basics" description="Kitchen display setup and bump workflow." />
      </div>
      <KdsKitchenDailyClient
        initialOrders={orders}
        userId={dataUserId}
        canBump={hasPermission(granted, "kitchen.bump")}
        canRecall={hasPermission(granted, "kitchen.recall")}
      />
    </div>
  );
}

export async function KitchenStandardAsyncSection({
  dataUserId,
  sessionUserId,
  sessionEmail,
  granted,
  searchParams,
}: {
  dataUserId: string;
  sessionUserId: string;
  sessionEmail: string | null;
  granted: ReadonlySet<PermissionKey>;
  searchParams: { station?: string; mode?: string; fullscreen?: string; card?: string };
}) {
  const profile = await prisma.userProfile.findUnique({
    where: { id: sessionUserId },
    select: {
      kitchenSettings: { select: { businessType: true } },
      role: true,
      email: true,
    },
  });

  const bundle = await loadKitchenScreenBundle({
    userId: dataUserId,
    sessionEmail: sessionEmail ?? profile?.email ?? null,
    profileBusinessType: profile?.kitchenSettings?.businessType ?? null,
    userRole: (profile?.role ?? "OWNER") as UserRole,
  });

  const initialStation = normalizeKitchenStationSlug(searchParams.station);
  const initialMode: KitchenScreenMode = normalizeKitchenScreenMode(searchParams.mode);
  const initialFullscreen = searchParams.fullscreen === "1";
  const initialCardSize = normalizeKitchenCardSize(searchParams.card);

  const kitchenUiPermissions: KitchenGranted = {
    "kitchen.bump": hasPermission(granted, "kitchen.bump"),
    "kitchen.recall": hasPermission(granted, "kitchen.recall"),
    "kitchen.configure": hasPermission(granted, "kitchen.configure"),
    "kitchen.expo.manage": hasPermission(granted, "kitchen.expo.manage"),
  };

  return (
    <KitchenScreenClient
      bundle={bundle}
      initialStation={initialStation}
      initialMode={initialMode}
      initialFullscreen={initialFullscreen}
      initialCardSize={initialCardSize}
      kitchenPermissions={kitchenUiPermissions}
    />
  );
}
