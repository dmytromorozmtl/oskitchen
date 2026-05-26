"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  createProductionPlanTask,
  updateProductionPlanTaskDate,
} from "@/services/production/production-calendar-service";

export async function createPlanTaskAction(formData: FormData): Promise<void> {
  const { userId } = await requireTenantActor();
  await createProductionPlanTask(userId, {
    title: String(formData.get("title") ?? "Batch"),
    planDate: new Date(String(formData.get("planDate") ?? new Date().toISOString().slice(0, 10))),
    batchSize: Number(formData.get("batchSize") ?? 0) || undefined,
    notes: String(formData.get("notes") ?? "") || undefined,
  });
  revalidatePath("/dashboard/production/calendar");
}

export async function movePlanTaskAction(formData: FormData): Promise<void> {
  const { userId } = await requireTenantActor();
  await updateProductionPlanTaskDate(
    String(formData.get("taskId") ?? ""),
    userId,
    new Date(String(formData.get("planDate") ?? "")),
  );
  revalidatePath("/dashboard/production/calendar");
}
