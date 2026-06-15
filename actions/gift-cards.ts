"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRewardsMutation } from "@/lib/crm/require-rewards-mutation";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { createGiftCard } from "@/services/gift-cards/gift-card-service";

const createGiftCardSchema = z.object({
  amount: z.coerce.number().positive().max(100_000),
  purchaserEmail: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  notes: z
    .union([z.string().max(2000), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  code: z
    .union([z.string().max(32), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export async function createGiftCardAction(
  formData: FormData,
): Promise<{ error?: string } | void> {
  const parsed = createGiftCardSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid gift card data" };
  }

  const access = await requireRewardsMutation({
    required: "giftcards.manage",
    operation: "gift_cards.create",
    module: "gift_cards",
  });
  if (!access.ok) {
    return { error: access.error };
  }

  const { dataUserId } = await requireTenantActor();
  await createGiftCard(dataUserId, {
    amount: parsed.data.amount,
    purchaserEmail: parsed.data.purchaserEmail || undefined,
    notes: parsed.data.notes || undefined,
    code: parsed.data.code || undefined,
  });
  revalidatePath("/dashboard/gift-cards");
}
