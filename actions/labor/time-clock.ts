"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import * as timeClockService from "@/services/labor/time-clock-service";

const clockInSchema = z.object({
  staffId: z.string().uuid(),
  notes: z.string().optional(),
});

export async function clockInAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const parsed = clockInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid data");

  await timeClockService.clockIn(dataUserId, parsed.data.staffId, parsed.data.notes);
  revalidatePath("/dashboard/staff/time-clock");
}

export async function clockOutAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const entryId = z.string().uuid().safeParse(formData.get("entryId"));
  if (!entryId.success) throw new Error("Entry ID required");

  await timeClockService.clockOut(entryId.data, dataUserId);
  revalidatePath("/dashboard/staff/time-clock");
}
