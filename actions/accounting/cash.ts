"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { submitCashCount } from "@/services/accounting/cash-management-service";

const cashCountSchema = z.object({
  expectedAmount: z.coerce.number().nonnegative(),
  countedAmount: z.coerce.number().nonnegative(),
  shiftId: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function submitCashCountAction(formData: FormData): Promise<void> {
  const parsed = cashCountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const { dataUserId } = await requireTenantActor();
  await submitCashCount(dataUserId, dataUserId, {
    expectedAmount: parsed.data.expectedAmount,
    countedAmount: parsed.data.countedAmount,
    shiftId: parsed.data.shiftId || undefined,
    notes: parsed.data.notes || undefined,
  });
  revalidatePath("/dashboard/accounting/cash-counts");
}
