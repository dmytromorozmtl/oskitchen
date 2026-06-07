"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { logLaborPermissionDenied } from "@/services/labor/labor-permission-audit";
import {
  createScheduledShift,
  deleteScheduledShift,
  getWeeklySchedule,
  updateScheduledShift,
} from "@/services/labor/schedule-service";
import { assessScheduleGridMoveFromModel } from "@/services/labor/schedule-grid-drag-drop-service";

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

const moveShiftSchema = z.object({
  shiftId: z.string().uuid(),
  staffMemberId: z.string().uuid(),
  shiftDate: z.string().min(1),
});

export async function moveScheduleGridShiftAction(formData: FormData): Promise<void> {
  const actor = await requireScheduleMutationAccess("labor.move_shift");
  const parsed = moveShiftSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid shift move");

  const weekStart = new Date(parsed.data.shiftDate);
  weekStart.setHours(0, 0, 0, 0);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);

  const shifts = await getWeeklySchedule(actor.userId, weekStart);
  const shiftRows = shifts.map((s) => ({
    id: s.id,
    staffMemberId: s.staffMemberId,
    shiftDate: s.shiftDate.toISOString().slice(0, 10),
    startTime: s.startTime,
    endTime: s.endTime,
    roleLabel: s.roleLabel,
    status: s.status,
    laborCost: Number(s.laborCost),
    staffName: s.staffMember.name,
    locationName: s.location?.name ?? null,
  }));

  const conflicts = assessScheduleGridMoveFromModel(shiftRows, parsed.data);
  if (conflicts.some((c) => c.kind === "overlap")) {
    throw new Error(conflicts.find((c) => c.kind === "overlap")?.message ?? "Shift overlap");
  }

  await updateScheduledShift(parsed.data.shiftId, actor.userId, {
    staffMemberId: parsed.data.staffMemberId,
    shiftDate: new Date(parsed.data.shiftDate),
  });
  revalidatePath("/dashboard/staff/schedule");
}
