"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRewardsMutation } from "@/lib/crm/require-rewards-mutation";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { resolveStorefrontAdminAccess } from "@/lib/storefront/storefront-admin-access";
import { issueStorefrontGiftCard } from "@/services/storefront/gift-card-service";

const issueSchema = z.object({
  amount: z.coerce.number().positive().max(10000),
  recipientEmail: z.string().email().optional().or(z.literal("")),
  recipientName: z.string().max(255).optional(),
  message: z.string().max(2000).optional(),
});

export async function issueGiftCardFormAction(formData: FormData) {
  try {
    const access = await requireRewardsMutation({
      required: "giftcards.manage",
      operation: "storefront.gift_cards.issue",
      module: "gift_cards",
    });
    if (!access.ok) return { error: access.error };

    const { sessionUser, userId } = await requireTenantActor();
    const adminAccess = await resolveStorefrontAdminAccess(sessionUser.id);
    if (!adminAccess.ok) return { error: adminAccess.error };
    if (adminAccess.storefront.userId !== userId) {
      return { error: "Storefront not found." };
    }

    const parsed = issueSchema.safeParse({
      amount: formData.get("amount"),
      recipientEmail: formData.get("recipientEmail")?.toString() ?? "",
      recipientName: formData.get("recipientName")?.toString(),
      message: formData.get("message")?.toString(),
    });
    if (!parsed.success) return { error: "Check gift card fields." };

    const card = await issueStorefrontGiftCard({
      userId,
      storefrontId: adminAccess.storefront.id,
      amount: parsed.data.amount,
      recipientEmail: parsed.data.recipientEmail || undefined,
      recipientName: parsed.data.recipientName,
      message: parsed.data.message,
    });
    revalidatePath("/dashboard/storefront/gift-cards");
    return { ok: true as const, code: card.code };
  } catch (e) {
    return { error: safeError(e) };
  }
}
