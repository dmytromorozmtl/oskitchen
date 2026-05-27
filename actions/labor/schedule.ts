"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { logLaborPermissionDenied } from "@/services/labor/labor-permission-audit";
import {
  createScheduledShift,
  deleteScheduledShift,
  updateScheduledShift,
} from "@/services/labor/schedule-service";

const shiftSchema = z.object({
  staffMemberId: z.string().uuid(),
  shiftDate: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  roleLabel: z.string().optional(),
  locationId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

async function requireScheduleMutationAccess(operation: string) {
  const access = await requireMutationPermission("schedule.manage");
  if (!access.ok) {
    await logLaborPermissionDenied(access.actor, {
      requiredPermission: "schedule.manage",
      operation,
    });
    throw new Error(access.error);
  }
  return access.actor;
}

export async function createShiftAction(formData: FormData): Promise<void> {
  const actor = await requireScheduleMutationAccess("labor.create_shift");
  const parsed = shiftSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid shift data");

  const result = await createScheduledShift(actor.userId, {
    ...parsed.data,
    shiftDate: new Date(parsed.data.shiftDate),
    performedById: actor.sessionUserId,
  });
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/dashboard/staff/schedule");
}

export async function updateShiftAction(formData: FormData): Promise<void> {
  const actor = await requireScheduleMutationAccess("labor.update_shift");
  const shiftId = z.string().uuid().parse(formData.get("shiftId"));
  const shiftDate = formData.get("shiftDate");
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");

  await updateScheduledShift(shiftId, actor.userId, {
    shiftDate: shiftDate ? new Date(String(shiftDate)) : undefined,
    startTime: startTime ? String(startTime) : undefined,
    endTime: endTime ? String(endTime) : undefined,
    roleLabel: (formData.get("roleLabel") as string) || undefined,
  });
  revalidatePath("/dashboard/staff/schedule");
}

export async function deleteShiftAction(formData: FormData): Promise<void> {
  const actor = await requireScheduleMutationAccess("labor.delete_shift");
  const shiftId = z.string().uuid().parse(formData.get("shiftId"));
  await deleteScheduledShift(shiftId, actor.userId);
  revalidatePath("/dashboard/staff/schedule");
}
