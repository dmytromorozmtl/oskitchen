"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { createIngredientCsvPreviewJob } from "@/services/import-export/import-service";

const PATHS = [
  "/dashboard/import-export",
  "/dashboard/import-export/import",
  "/dashboard/import-export/export",
  "/dashboard/import-export/templates",
  "/dashboard/import-export/imports",
  "/dashboard/import-export/exports",
  "/dashboard/import-export/validation-errors",
  "/dashboard/import-export/settings",
];

function revalidateAll() {
  for (const p of PATHS) revalidatePath(p);
}

export async function validateIngredientImportPreviewAction(
  formData: FormData,
): Promise<{ ok: true; importJobId: string } | { ok: false; error: string }> {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return { ok: false, error: "Choose a CSV file." };
    }
    if (file.size === 0) {
      return { ok: false, error: "File is empty." };
    }
    const text = await file.text();
    const r = await createIngredientCsvPreviewJob(userId, user.id, file.name || "upload.csv", text);
    if (!r.ok) return { ok: false, error: r.error };
    revalidateAll();
    return { ok: true, importJobId: r.importJobId };
  } catch (e) {
    return { ok: false, error: safeError(e) };
  }
}
