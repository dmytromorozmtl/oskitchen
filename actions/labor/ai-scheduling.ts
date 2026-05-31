"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { logLaborPermissionDenied } from "@/services/labor/labor-permission-audit";
import { loadAiSchedulePlan, type AiSchedulePlan } from "@/services/labor/ai-scheduling-service";
import { createScheduledShift } from "@/services/labor/schedule-service";

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

export async function generateAiScheduleAction(formData: FormData): Promise<AiSchedulePlan> {
  const actor = await requireScheduleMutationAccess("labor.generate_ai_schedule");
  const weekStartRaw = formData.get("weekStart");
  const targetLaborPctRaw = formData.get("targetLaborPct");

  const weekStart = weekStartRaw ? new Date(String(weekStartRaw)) : new Date();
  const targetLaborPct = targetLaborPctRaw ? Number(targetLaborPctRaw) : 28;
  if (!Number.isFinite(targetLaborPct) || targetLaborPct <= 0 || targetLaborPct > 80) {
    throw new Error("Target labor % must be between 1 and 80");
  }

  return loadAiSchedulePlan(actor.userId, weekStart, targetLaborPct);
}

const applySchema = z.object({
  shifts: z.array(
    z.object({
      staffMemberId: z.string().uuid(),
      shiftDateIso: z.string().min(1),
      startTime: z.string().min(1),
      endTime: z.string().min(1),
      roleLabel: z.string().optional(),
    }),
  ),
});

export async function applyAiScheduleAction(formData: FormData): Promise<{ created: number; skipped: number }> {
  const actor = await requireScheduleMutationAccess("labor.apply_ai_schedule");
  const raw = formData.get("shiftsJson");
  if (!raw) throw new Error("Missing shift payload");

  const parsed = applySchema.safeParse(JSON.parse(String(raw)));
  if (!parsed.success) throw new Error("Invalid shift payload");

  let created = 0;
  let skipped = 0;

  for (const shift of parsed.data.shifts) {
    const result = await createScheduledShift(actor.userId, {
      staffMemberId: shift.staffMemberId,
      shiftDate: new Date(shift.shiftDateIso),
      startTime: shift.startTime,
      endTime: shift.endTime,
      roleLabel: shift.roleLabel,
      performedById: actor.sessionUserId,
      notes: "AI schedule suggestion",
    });
    if (result.ok) created += 1;
    else skipped += 1;
  }

  revalidatePath("/dashboard/staff/schedule");
  revalidatePath("/dashboard/staff/ai-scheduling");
  return { created, skipped };
}
