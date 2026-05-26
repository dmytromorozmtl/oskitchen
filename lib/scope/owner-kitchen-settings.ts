import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/** Kitchen settings row for the workspace owner (`dataUserId`), not the session user. */
export async function findOwnerKitchenSettings<T extends Prisma.KitchenSettingsSelect>(
  ownerUserId: string,
  select: T,
): Promise<Prisma.KitchenSettingsGetPayload<{ select: T }> | null> {
  return prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select,
  });
}
