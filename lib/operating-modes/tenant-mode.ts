import type { KitchenOperatingMode } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getOperatingModeForBusinessType } from "./resolver";

export async function getTenantOperatingMode(userId: string): Promise<KitchenOperatingMode> {
  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { operatingMode: true, businessType: true },
  });
  if (settings?.operatingMode) return settings.operatingMode;
  return getOperatingModeForBusinessType(settings?.businessType ?? null) as KitchenOperatingMode;
}
