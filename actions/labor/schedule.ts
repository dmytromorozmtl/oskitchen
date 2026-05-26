"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
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

export async function createShiftAction(formData: FormData): Promise<void> {
  const { dataUserId, sessionUserId } = await requireTenantActor();
  const parsed = shiftSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid shift data");

  const result = await createScheduledShift(dataUserId, {
    ...parsed.data,
    shiftDate: new Date(parsed.data.shiftDate),
    performedById: sessionUserId,
  });
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/dashboard/staff/schedule");
}

export async function updateShiftAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const shiftId = z.string().uuid().parse(formData.get("shiftId"));
  const shiftDate = formData.get("shiftDate");
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");

  await updateScheduledShift(shiftId, dataUserId, {
    shiftDate: shiftDate ? new Date(String(shiftDate)) : undefined,
    startTime: startTime ? String(startTime) : undefined,
    endTime: endTime ? String(endTime) : undefined,
    roleLabel: (formData.get("roleLabel") as string) || undefined,
  });
  revalidatePath("/dashboard/staff/schedule");
}

export async function deleteShiftAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const shiftId = z.string().uuid().parse(formData.get("shiftId"));
  await deleteScheduledShift(shiftId, dataUserId);
  revalidatePath("/dashboard/staff/schedule");
}
