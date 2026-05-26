"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  bulkUpdateSupplierPrices,
  undoLastBulkPriceChange,
} from "@/services/purchasing/bulk-price-service";

const updatesSchema = z.array(
  z.object({
    supplierItemId: z.string().uuid(),
    unitCost: z.number().nonnegative(),
  }),
);

export async function bulkUpdatePricesAction(
  formData: FormData,
): Promise<{ error?: string; updated?: number } | void> {
  const raw = String(formData.get("updates") ?? "[]");
  let parsed: z.infer<typeof updatesSchema>;
  try {
    parsed = updatesSchema.parse(JSON.parse(raw));
  } catch {
    return { error: "Invalid price updates payload" };
  }

  const { dataUserId } = await requireTenantActor();
  await bulkUpdateSupplierPrices(dataUserId, parsed);
  revalidatePath("/dashboard/purchasing/bulk-pricing");
  return { updated: parsed.length };
}

export async function undoBulkPricesAction(): Promise<{ error?: string; undone?: number } | void> {
  const { dataUserId } = await requireTenantActor();
  const { undone } = await undoLastBulkPriceChange(dataUserId);
  revalidatePath("/dashboard/purchasing/bulk-pricing");
  return { undone };
}
