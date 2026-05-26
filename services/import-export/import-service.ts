import { randomUUID } from "crypto";

import { ImportStatus, ImportType, Prisma } from "@prisma/client";

import { parseCsv } from "@/lib/import-export/csv-parser";
import { buildIngredientImportPreview } from "@/lib/import-export/import-preview";
import { MAX_IMPORT_BYTES, MAX_IMPORT_ROWS, MAX_PREVIEW_ROWS_PERSISTED } from "@/lib/import-export/limits";
import { prisma } from "@/lib/prisma";

export type CreatePreviewResult =
  | { ok: true; importJobId: string }
  | { ok: false; error: string };

export async function createIngredientCsvPreviewJob(
  userId: string,
  createdById: string | undefined,
  fileName: string,
  csvText: string,
): Promise<CreatePreviewResult> {
  const bytes = Buffer.byteLength(csvText, "utf8");
  if (bytes > MAX_IMPORT_BYTES) {
    return { ok: false, error: `File exceeds limit of ${MAX_IMPORT_BYTES} bytes.` };
  }
  let parsed;
  try {
    parsed = parseCsv(csvText, MAX_IMPORT_ROWS);
  } catch {
    return { ok: false, error: "Could not parse CSV." };
  }
  if (parsed.headers.length === 0) {
    return { ok: false, error: "CSV has no header row." };
  }
  const { rows: previewRows, summary } = buildIngredientImportPreview(parsed.rows);

  try {
    const jobId = await prisma.$transaction(async (tx) => {
      const job = await tx.importJob.create({
        data: {
          userId,
          type: ImportType.INGREDIENTS,
          filename: fileName.slice(0, 512),
          status: ImportStatus.VALIDATED,
          totalRows: summary.totalRows,
          validRows: summary.validRows,
          errorRows: summary.errorRows,
          fileSize: bytes,
          warningRows: summary.warningRows,
          duplicateRows: summary.duplicateRows,
          skippedRows: summary.skipCount,
          updatedRows: summary.updateCount,
          createdRows: summary.createCount,
          resultJson: { summary, mode: "preview_only" } as Prisma.InputJsonValue,
          createdById: createdById ?? undefined,
          completedAt: new Date(),
        },
      });

      const slice = previewRows.slice(0, MAX_PREVIEW_ROWS_PERSISTED);
      if (slice.length > 0) {
        await tx.importJobPreviewRow.createMany({
          data: slice.map((r) => ({
            id: randomUUID(),
            importJobId: job.id,
            rowNumber: r.rowNumber,
            rawJson: r.raw as Prisma.InputJsonValue,
            normalizedJson: r.normalized != null ? (r.normalized as Prisma.InputJsonValue) : undefined,
            validationStatus: r.validationStatus,
            errorsJson: r.errors.length ? (r.errors as Prisma.InputJsonValue) : undefined,
            warningsJson: r.warnings.length ? (r.warnings as Prisma.InputJsonValue) : undefined,
            action: r.action,
          })),
        });
      }
      return job.id;
    });
    return { ok: true, importJobId: jobId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Import job failed.";
    return { ok: false, error: msg };
  }
}
