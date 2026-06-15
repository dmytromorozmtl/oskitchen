"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { logLaborPermissionDenied } from "@/services/labor/labor-permission-audit";
import * as timeClockService from "@/services/labor/time-clock-service";

const clockInSchema = z.object({
  staffId: z.string().uuid(),
  notes: z.string().optional(),
});

async function requireTimeClockMutationAccess(operation: string) {
  const access = await requireMutationPermission("timeclock.manage");
  if (!access.ok) {
    await logLaborPermissionDenied(access.actor, {
      requiredPermission: "timeclock.manage",
      operation,
    });
    throw new Error(access.error);
  }
  return access.actor;
}

export async function clockInAction(formData: FormData): Promise<void> {
  const actor = await requireTimeClockMutationAccess("labor.clock_in");
  const parsed = clockInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid data");

  await timeClockService.clockIn(actor.userId, parsed.data.staffId, parsed.data.notes);
  revalidatePath("/dashboard/staff/time-clock");
}

export async function clockOutAction(formData: FormData): Promise<void> {
  const actor = await requireTimeClockMutationAccess("labor.clock_out");
  const entryId = z.string().uuid().safeParse(formData.get("entryId"));
  if (!entryId.success) throw new Error("Entry ID required");

  await timeClockService.clockOut(entryId.data, actor.userId);
  revalidatePath("/dashboard/staff/time-clock");
}
