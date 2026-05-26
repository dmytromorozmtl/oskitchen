import type { ImportCommitMode, ImportType } from "@prisma/client";

import { applyMapping, missingRequiredColumns } from "@/lib/import-center/column-mapping";
import {
  dedupeKey,
  emptyExistingMatchLookup,
  type ExistingMatchLookup,
} from "@/lib/import-center/duplicate-detection";
import { suggestImportMapping } from "@/lib/import-center/column-mapping";
import { validateRow } from "@/lib/import-center/validators";
import type {
  PreviewResult,
  PreviewRowDraft,
  PreviewSummary,
} from "@/lib/import-center/import-types";

function emptySummary(totalRows: number): PreviewSummary {
  return {
    totalRows,
    validRows: 0,
    warningRows: 0,
    errorRows: 0,
    duplicateRows: 0,
    skippedRows: 0,
    createCount: 0,
    updateCount: 0,
    rejectCount: 0,
  };
}

export type BuildPreviewInput = {
  type: ImportType;
  headers: string[];
  rows: Record<string, string>[];
  mappingOverride?: Record<string, string>;
  commitMode: ImportCommitMode;
  existing?: ExistingMatchLookup;
};

export function buildImportPreview(input: BuildPreviewInput): PreviewResult {
  const { type, headers, rows, mappingOverride, commitMode } = input;
  const existing = input.existing ?? emptyExistingMatchLookup();
  const mapping = mappingOverride ?? suggestImportMapping(type, headers);
  const missing = missingRequiredColumns(type, mapping);

  if (rows.length === 0 || missing.length > 0) {
    return {
      headers,
      rows: rows.map((raw, idx) => ({
        rowNumber: idx + 2,
        raw,
        normalized: null,
        validationStatus: "ERROR",
        action: "REJECT",
        errors: missing.length
          ? missing.map((field) => ({
              code: "REQUIRED_COLUMN_MISSING",
              message: `Required column '${field}' is missing from the CSV.`,
            }))
          : [{ code: "EMPTY_FILE", message: "CSV has no data rows." }],
        warnings: [],
      })),
      summary: emptySummary(rows.length),
      unresolvedRequiredColumns: missing,
    };
  }

  const seenInBatch = new Map<string, number>();
  const preview: PreviewRowDraft[] = [];
  const summary = emptySummary(rows.length);

  rows.forEach((rawRow, idx) => {
    const rowNumber = idx + 2;
    const mapped = applyMapping(rawRow, mapping);
    const { normalized, errors, warnings } = validateRow(type, mapped);

    let status: PreviewRowDraft["validationStatus"] = "VALID";
    let action: PreviewRowDraft["action"] = "CREATE";
    let duplicateOfId: string | null = null;
    let targetEntityId: string | null = null;

    if (errors.length > 0) {
      status = "ERROR";
      action = "REJECT";
      summary.errorRows += 1;
      summary.rejectCount += 1;
    } else {
      const key = dedupeKey(type, normalized);
      const existingId = key ? existing.matches.get(key) ?? null : null;
      const seenAt = key ? seenInBatch.get(key) : undefined;

      if (existingId) {
        targetEntityId = existingId;
        switch (commitMode) {
          case "CREATE_ONLY": {
            status = "DUPLICATE";
            action = "SKIP";
            summary.duplicateRows += 1;
            summary.skippedRows += 1;
            break;
          }
          case "UPDATE_EXISTING": {
            status = warnings.length ? "WARNING" : "VALID";
            action = "UPDATE";
            if (warnings.length) summary.warningRows += 1;
            else summary.validRows += 1;
            summary.updateCount += 1;
            break;
          }
          case "UPSERT": {
            status = warnings.length ? "WARNING" : "VALID";
            action = "UPDATE";
            if (warnings.length) summary.warningRows += 1;
            else summary.validRows += 1;
            summary.updateCount += 1;
            break;
          }
          case "SKIP_DUPLICATES":
          default: {
            status = "DUPLICATE";
            action = "SKIP";
            summary.duplicateRows += 1;
            summary.skippedRows += 1;
            break;
          }
        }
      } else if (seenAt !== undefined) {
        status = "DUPLICATE";
        action = "SKIP";
        summary.duplicateRows += 1;
        summary.skippedRows += 1;
        duplicateOfId = null;
      } else {
        if (commitMode === "UPDATE_EXISTING") {
          status = "SKIPPED";
          action = "SKIP";
          summary.skippedRows += 1;
        } else {
          status = warnings.length ? "WARNING" : "VALID";
          action = "CREATE";
          if (warnings.length) summary.warningRows += 1;
          else summary.validRows += 1;
          summary.createCount += 1;
        }
      }
      if (key) seenInBatch.set(key, rowNumber);
    }

    preview.push({
      rowNumber,
      raw: rawRow,
      normalized,
      validationStatus: status,
      action,
      errors,
      warnings,
      duplicateOfId,
      targetEntityId,
    });
  });

  return { headers, rows: preview, summary, unresolvedRequiredColumns: [] };
}

export function previewCommitableRowIds(rows: PreviewRowDraft[], includeWarnings: boolean): number[] {
  return rows
    .filter((r) =>
      r.validationStatus === "VALID" ||
      (includeWarnings && r.validationStatus === "WARNING"),
    )
    .map((r) => r.rowNumber);
}
