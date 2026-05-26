"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { safeError } from "@/lib/security";
import { issueStorefrontGiftCard } from "@/services/storefront/gift-card-service";

const issueSchema = z.object({
  amount: z.coerce.number().positive().max(10000),
  recipientEmail: z.string().email().optional().or(z.literal("")),
  recipientName: z.string().max(255).optional(),
  message: z.string().max(2000).optional(),
});

export async function issueGiftCardFormAction(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const { sf } = await requireAdminStorefrontRow("storefront.settings", { id: true });
    if (!sf) return { error: "Storefront not found." };
    const parsed = issueSchema.safeParse({
      amount: formData.get("amount"),
      recipientEmail: formData.get("recipientEmail")?.toString() ?? "",
      recipientName: formData.get("recipientName")?.toString(),
      message: formData.get("message")?.toString(),
    });
    if (!parsed.success) return { error: "Check gift card fields." };
    const card = await issueStorefrontGiftCard({
      userId: user.id,
      storefrontId: sf.id,
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
