"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  createProductionPlanTask,
  updateProductionPlanTaskDate,
} from "@/services/production/production-calendar-service";

async function requireProductionCalendarMutation(
  operation: string,
): Promise<{ ok: true } | { ok: false }> {
  const permission: PermissionKey = "production.manage";
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "production_calendar.permission_denied",
      entityType: "ProductionCalendar",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false };
  }
  return { ok: true };
}

export async function createPlanTaskAction(formData: FormData): Promise<void> {
  const gate = await requireProductionCalendarMutation("production_calendar.create_task");
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  await createProductionPlanTask(dataUserId, {
    title: String(formData.get("title") ?? "Batch"),
    planDate: new Date(String(formData.get("planDate") ?? new Date().toISOString().slice(0, 10))),
    batchSize: Number(formData.get("batchSize") ?? 0) || undefined,
    notes: String(formData.get("notes") ?? "") || undefined,
  });
  revalidatePath("/dashboard/production/calendar");
}

export async function movePlanTaskAction(formData: FormData): Promise<void> {
  const gate = await requireProductionCalendarMutation("production_calendar.move_task");
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  await updateProductionPlanTaskDate(
    String(formData.get("taskId") ?? ""),
    dataUserId,
    new Date(String(formData.get("planDate") ?? "")),
  );
  revalidatePath("/dashboard/production/calendar");
}
