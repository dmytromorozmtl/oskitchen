"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { validateImportCsvUpload } from "@/lib/upload-policy/media-upload-validation";
import { logUploadDenied } from "@/services/audit/upload-audit";
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
    const { sessionUser: user, userId, workspaceId } = await requireTenantActor();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return { ok: false, error: "Choose a CSV file." };
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const validated = validateImportCsvUpload({
      bytes,
      filename: file.name || "upload.csv",
    });
    if (!validated.ok) {
      void logUploadDenied({
        channel: "import_csv",
        actorUserId: user.id,
        workspaceId,
        entity: { type: "ImportJob", id: "ingredient_preview" },
        mimeType: "text/csv",
        sizeBytes: bytes.byteLength,
        reason: validated.error,
      });
      return { ok: false, error: validated.error };
    }
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const r = await createIngredientCsvPreviewJob(userId, user.id, file.name || "upload.csv", text);
    if (!r.ok) return { ok: false, error: r.error };
    revalidateAll();
    return { ok: true, importJobId: r.importJobId };
  } catch (e) {
    return { ok: false, error: safeError(e) };
  }
}
