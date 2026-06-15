"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { requireRewardsMutation } from "@/lib/crm/require-rewards-mutation";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  getOrCreateLoyaltyProgram,
  updateLoyaltyProgram,
} from "@/services/loyalty/loyalty-service";
import {
  mergeRestaurantLoyaltyIntoSettingsCenter,
  parseRestaurantLoyaltyConfig,
} from "@/lib/loyalty/restaurant-loyalty-settings";
import { prisma } from "@/lib/prisma";

const loyaltyProgramSchema = z.object({
  pointsPerDollar: z.coerce.number().min(0.1).max(100),
  redeemPointsThreshold: z.coerce.number().int().min(1).max(1_000_000),
  redeemValueCents: z.coerce.number().int().min(1).max(1_000_000),
  active: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true"),
});

export async function updateLoyaltyProgramAction(
  formData: FormData,
): Promise<{ error?: string } | void> {
  const parsed = loyaltyProgramSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid loyalty program settings" };
  }

  const access = await requireRewardsMutation({
    required: "loyalty.manage",
    operation: "loyalty.program.update",
    module: "loyalty",
  });
  if (!access.ok) {
    return { error: access.error };
  }

  const { dataUserId } = await requireTenantActor();
  await updateLoyaltyProgram(dataUserId, parsed.data);
  revalidatePath("/dashboard/customers/loyalty");
}

const restaurantLoyaltySchema = z.object({
  enabled: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true"),
  visitRewardEvery: z.coerce.number().int().min(0).max(100),
  visitRewardPoints: z.coerce.number().int().min(0).max(10_000),
  itemBonusesJson: z.string().optional(),
  tiersJson: z.string().optional(),
});

export async function updateRestaurantLoyaltyConfigAction(
  formData: FormData,
): Promise<{ error?: string } | void> {
  const parsed = restaurantLoyaltySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid restaurant loyalty settings" };
  }

  const access = await requireRewardsMutation({
    required: "loyalty.manage",
    operation: "loyalty.restaurant.update",
    module: "loyalty",
  });
  if (!access.ok) {
    return { error: access.error };
  }

  let itemBonuses: unknown[] = [];
  let tiers: unknown[] = [];
  try {
    if (parsed.data.itemBonusesJson) itemBonuses = JSON.parse(parsed.data.itemBonusesJson) as unknown[];
    if (parsed.data.tiersJson) tiers = JSON.parse(parsed.data.tiersJson) as unknown[];
  } catch {
    return { error: "Invalid bonus or tier JSON." };
  }

  const config = parseRestaurantLoyaltyConfig({
    enabled: parsed.data.enabled,
    visitRewardEvery: parsed.data.visitRewardEvery,
    visitRewardPoints: parsed.data.visitRewardPoints,
    itemBonuses,
    tiers,
  });

  const { dataUserId } = await requireTenantActor();
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: dataUserId },
    select: { settingsCenterJson: true },
  });
  const merged = mergeRestaurantLoyaltyIntoSettingsCenter(
    kitchen?.settingsCenterJson,
    config,
  ) as Prisma.InputJsonValue;
  await prisma.kitchenSettings.upsert({
    where: { userId: dataUserId },
    create: { userId: dataUserId, settingsCenterJson: merged },
    update: { settingsCenterJson: merged },
  });

  revalidatePath("/dashboard/customers/loyalty");
}
