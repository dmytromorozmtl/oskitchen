"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { KitchenOperatingMode } from "@prisma/client";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";

const modeSchema = z.enum(["WEEKLY_PREORDER", "DAILY_SERVICE"]);

export async function updateKitchenOperatingMode(
  mode: KitchenOperatingMode,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = modeSchema.safeParse(mode);
  if (!parsed.success) return { ok: false, error: "Invalid operating mode." };

  const { dataUserId } = await requireTenantActor();
  await prisma.kitchenSettings.update({
    where: { userId: dataUserId },
    data: { operatingMode: parsed.data },
  });

  revalidatePath("/dashboard/settings/workspace");
  revalidatePath("/dashboard/production");
  revalidatePath("/dashboard/pos/terminal");
  revalidatePath("/dashboard/kitchen");
  return { ok: true };
}
