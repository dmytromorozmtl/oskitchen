"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  getOrCreateLoyaltyProgram,
  updateLoyaltyProgram,
} from "@/services/loyalty/loyalty-service";

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

  const { dataUserId } = await requireTenantActor();
  await updateLoyaltyProgram(dataUserId, parsed.data);
  revalidatePath("/dashboard/customers/loyalty");
}
