"use server";


import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { assertProductionCalendarFormGate } from "@/lib/production/production-calendar-form-mutation";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  createProductionPlanTask,
  updateProductionPlanTaskDate,
  updateProductionPlanTaskStatus,
} from "@/services/production/production-calendar-service";

async function requireProductionCalendarMutation(
  operation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
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
    return {
      ok: false,
      error: access.error ?? "You do not have permission to manage the production calendar.",
    };
  }
  return { ok: true };
}

export async function createPlanTaskAction(formData: FormData): Promise<void> {
  const gate = await requireProductionCalendarMutation("production_calendar.create_task");
  assertProductionCalendarFormGate(gate);

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
  assertProductionCalendarFormGate(gate);

  const { dataUserId } = await requireTenantActor();
  await updateProductionPlanTaskDate(
    String(formData.get("taskId") ?? ""),
    dataUserId,
    new Date(String(formData.get("planDate") ?? "")),
  );
  revalidatePath("/dashboard/production/calendar");
}

export async function updatePlanTaskStatusAction(formData: FormData): Promise<void> {
  const gate = await requireProductionCalendarMutation("production_calendar.update_task_status");
  assertProductionCalendarFormGate(gate);

  const { dataUserId } = await requireTenantActor();
  await updateProductionPlanTaskStatus(
    String(formData.get("taskId") ?? ""),
    dataUserId,
    String(formData.get("status") ?? ""),
  );
  revalidatePath("/dashboard/production/calendar");
}
