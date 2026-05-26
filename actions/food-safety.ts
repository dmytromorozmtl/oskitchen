"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import * as auditService from "@/services/food-safety/audit-service";
import * as correctiveService from "@/services/food-safety/corrective-action-service";
import * as checklistService from "@/services/food-safety/checklist-service";
import * as temperatureService from "@/services/food-safety/temperature-service";

const tempLogSchema = z.object({
  checkType: z.enum([
    "REFRIGERATOR",
    "FREEZER",
    "HOT_HOLDING",
    "COLD_HOLDING",
    "COOKING",
    "COOLING",
    "REHEATING",
    "RECEIVING",
  ]),
  temperature: z.coerce.number(),
  unit: z.string().optional(),
  targetMin: z.coerce.number().optional(),
  targetMax: z.coerce.number().optional(),
  notes: z.string().optional(),
  correctiveAction: z.string().optional(),
  locationId: z.string().uuid().optional(),
});

const checklistSchema = z.object({
  name: z.string().min(1),
  frequency: z.enum(["DAILY", "SHIFT", "WEEKLY"]),
  questions: z.string().min(1),
});

export async function logTemperatureAction(formData: FormData): Promise<void> {
  const { dataUserId, sessionUserId } = await requireTenantActor();
  const parsed = tempLogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid data");

  await temperatureService.logTemperature(dataUserId, {
    ...parsed.data,
    checkedById: sessionUserId,
  });
  revalidatePath("/dashboard/food-safety/temperature");
}

export async function createChecklistAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const parsed = checklistSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid data");

  const questions = parsed.data.questions
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean);
  if (questions.length === 0) throw new Error("Add at least one question");

  await checklistService.createChecklist(dataUserId, {
    name: parsed.data.name,
    frequency: parsed.data.frequency,
    questions,
  });
  revalidatePath("/dashboard/food-safety/checklists");
}

export async function startAuditAction(formData: FormData): Promise<void> {
  const { dataUserId, sessionUserId } = await requireTenantActor();
  const checklistId = z.string().uuid().safeParse(formData.get("checklistId"));
  if (!checklistId.success) throw new Error("Checklist required");

  const audit = await auditService.startAudit(
    dataUserId,
    checklistId.data,
    sessionUserId,
  );
  redirect(`/dashboard/food-safety/audits/${audit.id}`);
}

export async function submitAuditResponseAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const auditId = z.string().uuid().safeParse(formData.get("auditId"));
  const responseId = z.string().uuid().safeParse(formData.get("responseId"));
  const pass = formData.get("pass") === "on" || formData.get("pass") === "true";
  const notes = (formData.get("notes") as string) || undefined;
  if (!auditId.success || !responseId.success) throw new Error("Invalid data");

  await auditService.submitAuditResponse(
    auditId.data,
    dataUserId,
    responseId.data,
    pass,
    notes,
  );
  revalidatePath(`/dashboard/food-safety/audits/${auditId.data}`);
}

export async function addCorrectiveActionAction(formData: FormData): Promise<void> {
  const { dataUserId } = await requireTenantActor();
  const auditId = z.string().uuid().safeParse(formData.get("auditId"));
  const description = z.string().min(3).safeParse(formData.get("description"));
  if (!auditId.success || !description.success) throw new Error("Invalid data");

  await correctiveService.addCorrectiveAction({
    userId: dataUserId,
    auditId: auditId.data,
    description: description.data,
  });
  revalidatePath(`/dashboard/food-safety/audits/${auditId.data}`);
}

export async function verifyFoodSafetyAuditAction(formData: FormData): Promise<void> {
  const { dataUserId, sessionUserId } = await requireTenantActor();
  const auditId = z.string().uuid().safeParse(formData.get("auditId"));
  if (!auditId.success) throw new Error("Invalid audit");

  await correctiveService.verifyAudit({
    userId: dataUserId,
    auditId: auditId.data,
    verifiedById: sessionUserId,
  });
  revalidatePath(`/dashboard/food-safety/audits/${auditId.data}`);
  revalidatePath("/dashboard/food-safety/audits");
}
