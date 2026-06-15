import type { ImportPreviewSummary, ImportRowIssue } from "./import-types";
import { suggestColumnMapping } from "./column-mapping";
import { validateIngredientRow } from "./csv-validator";

export type PreviewRowResult = {
  rowNumber: number;
  raw: Record<string, string>;
  normalized: Record<string, unknown> | null;
  validationStatus: "VALID" | "WARNING" | "ERROR" | "DUPLICATE" | "SKIPPED";
  action: "CREATE" | "UPDATE" | "SKIP" | "REJECT";
  errors: ImportRowIssue[];
  warnings: ImportRowIssue[];
};

export function buildIngredientImportPreview(
  rows: Record<string, string>[],
  mappingOverride?: Record<string, string>,
): { rows: PreviewRowResult[]; summary: ImportPreviewSummary } {
  const headers = Object.keys(rows[0] ?? {});
  const mapping =
    mappingOverride ??
    suggestColumnMapping(headers, ["name", "unit", "category", "supplier", "costPerUnit"] as const);

  const seen = new Set<string>();
  const preview: PreviewRowResult[] = [];
  let valid = 0;
  let warning = 0;
  let error = 0;
  let dup = 0;
  let create = 0;
  let skip = 0;

  rows.forEach((raw, idx) => {
    const rowNumber = idx + 2;
    const { normalized, errors, warnings } = validateIngredientRow(raw, mapping);
    const key = normalized ? `${normalized.name.toLowerCase()}|${normalized.unit.toLowerCase()}` : "";
    let status: PreviewRowResult["validationStatus"] = "VALID";
    let action: PreviewRowResult["action"] = "CREATE";
    if (errors.length) {
      status = "ERROR";
      action = "REJECT";
      error++;
    } else if (key && seen.has(key)) {
      status = "DUPLICATE";
      action = "SKIP";
      dup++;
      skip++;
    } else {
      if (warnings.length) {
        status = "WARNING";
        warning++;
      } else {
        valid++;
      }
      create++;
      if (key) seen.add(key);
    }
    preview.push({
      rowNumber,
      raw,
      normalized: normalized as Record<string, unknown> | null,
      validationStatus: status,
      action,
      errors,
      warnings,
    });
  });

  return {
    rows: preview,
    summary: {
      totalRows: rows.length,
      validRows: valid,
      warningRows: warning,
      errorRows: error,
      duplicateRows: dup,
      createCount: create,
      updateCount: 0,
      skipCount: skip,
    },
  };
}
