"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { canUseImportCenter } from "@/lib/import-center/import-permissions";
import { commitNotSupportedReason, isCommittableType } from "@/lib/import-center/import-commit";
import type { ImportActorScope, ImportCapability } from "@/lib/import-center/import-types";
import { requireUserProfile } from "@/lib/auth";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";

import {
  cancelImportJob,
  commitImportJob,
  rollbackImportJob,
  uploadImportCsv,
} from "@/services/import-center/import-center-service";
import type { ImportCommitMode, ImportType } from "@prisma/client";

function scopeFrom(profile: { role: string | null; email: string | null }, isOwner: boolean): ImportActorScope {
  return { isOwner, role: profile.role, email: profile.email };
}

async function assertCapability(cap: ImportCapability) {
  const { sessionUser: user, userId } = await requireTenantActor();
  const profile = await requireUserProfile();
  const scope = scopeFrom(
    { role: profile.role ?? null, email: profile.email ?? null },
    user.id === userId,
  );
  if (!canUseImportCenter(scope, cap)) {
    throw new Error(`You do not have permission to ${cap}.`);
  }
  return { userId, profileId: profile.id };
}

const IMPORT_TYPE_VALUES = [
  "PRODUCTS",
  "CUSTOMERS",
  "ORDERS",
  "INGREDIENTS",
  "RECIPES",
  "STAFF",
  "SUPPLIERS",
  "BRANDS",
  "LOCATIONS",
  "NUTRITION_ALLERGENS",
  "PRODUCT_MAPPINGS",
  "MENU_ASSIGNMENTS",
  "PURCHASE_ITEMS",
] as const;

const COMMIT_MODE_VALUES = ["CREATE_ONLY", "UPDATE_EXISTING", "UPSERT", "SKIP_DUPLICATES"] as const;

const uploadSchema = z.object({
  type: z.enum(IMPORT_TYPE_VALUES),
  mode: z.enum(COMMIT_MODE_VALUES).default("CREATE_ONLY"),
});

export async function uploadImportCsvAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("import.upload");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please select a CSV file to upload.");
  }
  const parsed = uploadSchema.parse({
    type: formData.get("type"),
    mode: formData.get("mode") ?? "CREATE_ONLY",
  });
  const csvText = await file.text();
  const outcome = await uploadImportCsv({
    userId,
    performedById: profileId,
    type: parsed.type as ImportType,
    filename: file.name || "upload.csv",
    csvText,
    commitMode: parsed.mode as ImportCommitMode,
  });
  if (!outcome.ok) throw new Error(outcome.error);
  revalidatePath("/dashboard/import-center");
  revalidatePath("/dashboard/import-center/history");
  redirect(`/dashboard/import-center/jobs/${outcome.importJobId}`);
}

const commitSchema = z.object({
  jobId: z.string().uuid(),
  includeWarnings: z.boolean().default(false),
  confirm: z.literal(true),
});

export async function commitImportJobAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("import.commit");
  const parsed = commitSchema.parse({
    jobId: formData.get("jobId"),
    includeWarnings: formData.get("includeWarnings") === "on",
    confirm: formData.get("confirm") === "true",
  });
  const result = await commitImportJob({
    userId,
    performedById: profileId,
    jobId: parsed.jobId,
    includeWarnings: parsed.includeWarnings,
  });
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/dashboard/import-center");
  revalidatePath(`/dashboard/import-center/jobs/${parsed.jobId}`);
  revalidatePath("/dashboard/import-center/history");
}

const rollbackSchema = z.object({
  jobId: z.string().uuid(),
  reason: z.string().min(3, "Provide a reason for the rollback.").max(800),
  confirm: z.literal(true),
});

export async function rollbackImportJobAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("import.rollback");
  const parsed = rollbackSchema.parse({
    jobId: formData.get("jobId"),
    reason: formData.get("reason") ?? "",
    confirm: formData.get("confirm") === "true",
  });
  const result = await rollbackImportJob({
    userId,
    performedById: profileId,
    jobId: parsed.jobId,
    reason: parsed.reason,
  });
  if (!result.ok) throw new Error(result.error);
  revalidatePath(`/dashboard/import-center/jobs/${parsed.jobId}`);
  revalidatePath("/dashboard/import-center");
  revalidatePath("/dashboard/import-center/history");
}

const cancelSchema = z.object({
  jobId: z.string().uuid(),
  reason: z.string().max(400).optional(),
});

export async function cancelImportJobAction(formData: FormData): Promise<void> {
  const { userId } = await assertCapability("import.upload");
  const parsed = cancelSchema.parse({
    jobId: formData.get("jobId"),
    reason: (formData.get("reason") as string | null) ?? undefined,
  });
  const result = await cancelImportJob(userId, parsed.jobId, parsed.reason ?? null);
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/dashboard/import-center");
  revalidatePath(`/dashboard/import-center/jobs/${parsed.jobId}`);
}

export async function assertCommitable(type: ImportType): Promise<{ ok: boolean; reason?: string }> {
  if (isCommittableType(type)) return { ok: true };
  return { ok: false, reason: commitNotSupportedReason(type) };
}
