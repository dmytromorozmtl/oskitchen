"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { createTransferOrder } from "@/services/commissary/transfer-service";

const transferSchema = z.object({
  fromLocationId: z.string().uuid(),
  toLocationId: z.string().uuid(),
  ingredientId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1).max(40),
});

export async function createTransferAction(formData: FormData): Promise<void> {
  const parsed = transferSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const { dataUserId } = await requireTenantActor();
  await createTransferOrder(
    dataUserId,
    parsed.data.fromLocationId,
    parsed.data.toLocationId,
    [
      {
        ingredientId: parsed.data.ingredientId,
        quantity: parsed.data.quantity,
        unit: parsed.data.unit,
      },
    ],
  );
  revalidatePath("/dashboard/commissary/transfers");
}
