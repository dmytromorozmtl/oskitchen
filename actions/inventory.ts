"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
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

export async function logWasteEventAction(formData: FormData): Promise<void> {
  const { dataUserId, sessionUserId } = await requireTenantActor();
  const parsed = logWasteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid waste log");

  await wasteService.logWasteEvent(dataUserId, {
    ...parsed.data,
    recordedById: sessionUserId,
  });
  revalidatePath("/dashboard/inventory/waste");
}

export async function startInventoryCountAction(): Promise<void> {
  const { dataUserId, sessionUserId } = await requireTenantActor();
  const count = await countService.startInventoryCount(dataUserId, sessionUserId);
  redirect(`/dashboard/inventory/counts/${count.id}`);
}

export async function submitCountItemAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const parsed = countItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid count line");

  await countService.submitCountItem(
    parsed.data.countItemId,
    dataUserId,
    parsed.data.countedQty,
    parsed.data.notes,
  );
  revalidatePath("/dashboard/inventory/counts");
}

export async function completeInventoryCountAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const countId = z.string().uuid().safeParse(formData.get("countId"));
  if (!countId.success) throw new Error("Count ID required");

  await countService.completeInventoryCount(countId.data, dataUserId);
  revalidatePath("/dashboard/inventory/counts");
  redirect("/dashboard/inventory/counts");
}
