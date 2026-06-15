"use server";

import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  createDoorDashDelivery,
  getDoorDashQuote,
} from "@/services/integrations/doordash/doordash-service";

const quoteSchema = z.object({
  pickupAddress: z.string().min(5),
  deliveryAddress: z.string().min(5),
});

export async function requestDoorDashQuoteAction(formData: FormData) {
  await requireTenantActor();
  const parsed = quoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid pickup or delivery address.", "validation");
  const result = await getDoorDashQuote(parsed.data.pickupAddress, parsed.data.deliveryAddress);
  revalidatePath("/dashboard/integrations/doordash");
  return result.ok ? ok(result) : fail(result.message, "provider_placeholder");
}

export async function createDoorDashDeliveryAction(formData: FormData) {
  const { userId } = await requireTenantActor();
  const parsed = quoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid pickup or delivery address.", "validation");
  const orderId = formData.get("orderId");
  const result = await createDoorDashDelivery(
    orderId && String(orderId).length > 0 ? String(orderId) : null,
    userId,
    parsed.data,
  );
  revalidatePath("/dashboard/integrations/doordash");
  return result.ok ? ok(result) : fail(result.message, "provider_placeholder");
}
