"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  createOperationsChecklist,
  startOperationsAudit,
  submitOperationsResponse,
} from "@/services/operations/operations-service";

export async function createOperationsChecklistAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const name = z.string().min(1).parse(formData.get("name"));
  const frequency = z.enum(["DAILY", "SHIFT", "WEEKLY"]).parse(formData.get("frequency") ?? "DAILY");
  const questions = String(formData.get("questions") ?? "")
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean);
  if (questions.length === 0) throw new Error("Add questions");

  await createOperationsChecklist(dataUserId, { name, frequency, questions });
  revalidatePath("/dashboard/operations/checklists");
}

export async function startOperationsAuditAction(formData: FormData): Promise<void> {
  const { dataUserId, sessionUserId } = await requireTenantActor();
  const checklistId = z.string().uuid().parse(formData.get("checklistId"));
  const audit = await startOperationsAudit(dataUserId, checklistId, sessionUserId);
  redirect(`/dashboard/operations/audits/${audit.id}`);
}

export async function submitOperationsResponseAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const auditId = z.string().uuid().parse(formData.get("auditId"));
  const responseId = z.string().uuid().parse(formData.get("responseId"));
  const pass = formData.get("pass") === "on" || formData.get("pass") === "true";
  const notes = (formData.get("notes") as string) || undefined;
  const photoUrl = (formData.get("photoUrl") as string) || undefined;

  await submitOperationsResponse(auditId, dataUserId, responseId, pass, notes, photoUrl);
  revalidatePath(`/dashboard/operations/audits/${auditId}`);
}
