"use server";


import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  createOperationsChecklist,
  startOperationsAudit,
  submitOperationsResponse,
} from "@/services/operations/operations-service";

async function requireOperationsMutationPermission(operation: string): Promise<{ ok: true } | { ok: false }> {
  const permission: PermissionKey = "production.manage";
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "operations.permission_denied",
      entityType: "Operations",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false };
  }
  return { ok: true };
}

export async function createOperationsChecklistAction(formData: FormData): Promise<void> {
  const gate = await requireOperationsMutationPermission("operations.create_checklist");
  if (!gate.ok) return;

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
  const gate = await requireOperationsMutationPermission("operations.start_audit");
  if (!gate.ok) return;

  const { dataUserId, sessionUserId } = await requireTenantActor();
  const checklistId = z.string().uuid().parse(formData.get("checklistId"));
  const audit = await startOperationsAudit(dataUserId, checklistId, sessionUserId);
  redirect(`/dashboard/operations/audits/${audit.id}`);
}

export async function submitOperationsResponseAction(formData: FormData): Promise<void> {
  const gate = await requireOperationsMutationPermission("operations.submit_response");
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  const auditId = z.string().uuid().parse(formData.get("auditId"));
  const responseId = z.string().uuid().parse(formData.get("responseId"));
  const pass = formData.get("pass") === "on" || formData.get("pass") === "true";
  const notes = (formData.get("notes") as string) || undefined;
  const photoUrl = (formData.get("photoUrl") as string) || undefined;

  await submitOperationsResponse(auditId, dataUserId, responseId, pass, notes, photoUrl);
  revalidatePath(`/dashboard/operations/audits/${auditId}`);
}
