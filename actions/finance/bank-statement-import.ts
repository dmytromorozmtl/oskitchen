"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { enforceUploadContentSafety } from "@/lib/upload-policy/enforce-upload-content-safety";
import { validateInvoiceOcrImageUpload } from "@/lib/upload-policy/media-upload-validation";
import {
  commitBankStatementImport,
  previewBankStatementImport,
  type EnrichedBankLine,
} from "@/services/finance/bank-statement-import-service";

const enrichedLineSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
  category: z.string(),
  matchConfidence: z.number(),
  matchSuggestion: z
    .object({
      kind: z.enum(["order", "invoice"]),
      entityId: z.string().uuid(),
      label: z.string(),
      amount: z.number(),
      date: z.string(),
      confidence: z.number(),
      reason: z.string(),
    })
    .nullable(),
});

const commitSchema = z.object({
  lines: z.array(enrichedLineSchema).min(1),
});

export async function previewBankStatementAction(formData: FormData) {
  const access = await requireMutationPermission("reports.read.financial");
  if (!access.ok) return fail(access.error);

  const { dataUserId, sessionUser, workspaceId } = await requireTenantActor();
  const source = String(formData.get("source") ?? "csv") as "csv" | "pdf" | "photo";

  if (source === "csv") {
    const csvText = String(formData.get("csvText") ?? "").trim();
    if (!csvText) return fail("Paste or upload a CSV bank export.");
    const preview = await previewBankStatementImport(dataUserId, "csv", { csvText }, workspaceId);
    return ok({ preview });
  }

  if (source === "pdf") {
    const pdfText = String(formData.get("pdfText") ?? "").trim();
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const preview = await previewBankStatementImport(
        dataUserId,
        "pdf",
        { pdfBytes: bytes, text: pdfText || undefined },
        workspaceId,
      );
      return ok({ preview });
    }
    if (pdfText) {
      const preview = await previewBankStatementImport(dataUserId, "pdf", { text: pdfText }, workspaceId);
      return ok({ preview });
    }
    return fail("Upload a PDF or paste extracted statement text.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return fail("Upload a bank statement photo.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const validated = validateInvoiceOcrImageUpload({
    bytes,
    mimeType: file.type || "",
  });
  if (!validated.ok) return fail(validated.error);

  const safe = await enforceUploadContentSafety({
    bytes,
    mimeType: validated.mimeType,
    channel: "invoice_ocr_image",
    actorUserId: sessionUser.id,
    workspaceId: workspaceId ?? null,
    entity: { type: "BankStatementImport", id: "upload" },
  });
  if (!safe.ok) return fail(safe.error);

  const imageBase64 = Buffer.from(bytes).toString("base64");
  const preview = await previewBankStatementImport(
    dataUserId,
    "photo",
    { imageBase64 },
    workspaceId,
  );
  return ok({ preview });
}

export async function commitBankStatementAction(formData: FormData) {
  const access = await requireMutationPermission("reports.read.financial");
  if (!access.ok) return fail(access.error);

  const { dataUserId, workspaceId } = await requireTenantActor();
  const raw = String(formData.get("linesJson") ?? "");
  let parsed: z.infer<typeof commitSchema>;
  try {
    parsed = commitSchema.parse({ lines: JSON.parse(raw) as EnrichedBankLine[] });
  } catch {
    return fail("Invalid import payload.");
  }

  const result = await commitBankStatementImport(dataUserId, workspaceId, parsed.lines);
  revalidatePath("/dashboard/finance/bank-import");
  revalidatePath("/dashboard/accounting/bank-reconciliation");
  return ok({ result });
}
