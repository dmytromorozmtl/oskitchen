"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import * as countService from "@/services/inventory/count-service";
import * as wasteService from "@/services/inventory/waste-service";

const logWasteSchema = z.object({
  ingredientId: z.string().uuid(),
  quantity: z.coerce.number().min(0.01),
  unit: z.string().min(1),
  reason: z.enum([
    "SPOILAGE",
    "PREP_WASTE",
    "OVER_PRODUCTION",
    "THEFT",
    "DAMAGED",
    "EXPIRED",
    "OTHER",
  ]),
  cost: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const countItemSchema = z.object({
  countItemId: z.string().uuid(),
  countedQty: z.coerce.number().min(0),
  notes: z.string().optional(),
});

async function requireInventoryMutationAccess(operation: string) {
  const access = await requireMutationPermission("production.manage");
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "inventory.permission_denied",
      entityType: "Inventory",
      metadata: { operation, requiredPermission: "production.manage" },
    });
    throw new Error(access.error);
  }
  return access.actor;
}

export async function logWasteEventAction(formData: FormData): Promise<void> {
  const actor = await requireInventoryMutationAccess("inventory.log_waste");
  const parsed = logWasteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid waste log");

  await wasteService.logWasteEvent(actor.userId, {
    ...parsed.data,
    recordedById: actor.sessionUserId,
  });
  revalidatePath("/dashboard/inventory/waste");
}

export async function startInventoryCountAction(): Promise<void> {
  const actor = await requireInventoryMutationAccess("inventory.start_count");
  const count = await countService.startInventoryCount(actor.userId, actor.sessionUserId);
  redirect(`/dashboard/inventory/counts/${count.id}`);
}

export async function submitCountItemAction(formData: FormData): Promise<void> {
  const actor = await requireInventoryMutationAccess("inventory.submit_count_item");
  const parsed = countItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid count line");

  await countService.submitCountItem(
    parsed.data.countItemId,
    actor.userId,
    parsed.data.countedQty,
    parsed.data.notes,
  );
  revalidatePath("/dashboard/inventory/counts");
}

export async function completeInventoryCountAction(formData: FormData): Promise<void> {
  const actor = await requireInventoryMutationAccess("inventory.complete_count");
  const countId = z.string().uuid().safeParse(formData.get("countId"));
  if (!countId.success) throw new Error("Count ID required");

  await countService.completeInventoryCount(countId.data, actor.userId);
  revalidatePath("/dashboard/inventory/counts");
  redirect("/dashboard/inventory/counts");
}
