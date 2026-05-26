import type { ImportRowIssue } from "./import-types";

export type IngredientImportCandidate = {
  name: string;
  unit: string;
  category?: string;
  supplier?: string;
  costPerUnit?: string;
};

export function validateIngredientRow(
  row: Record<string, string>,
  canonicalToCsv: Record<string, string>,
): { normalized: IngredientImportCandidate | null; errors: ImportRowIssue[]; warnings: ImportRowIssue[] } {
  const errors: ImportRowIssue[] = [];
  const warnings: ImportRowIssue[] = [];
  const cell = (key: string) => {
    const h = canonicalToCsv[key];
    return h ? (row[h] ?? "").trim() : "";
  };
  const name = cell("name");
  const unit = cell("unit");
  if (!name) errors.push({ code: "NAME_REQUIRED", message: "Ingredient name is required." });
  if (!unit) errors.push({ code: "UNIT_REQUIRED", message: "Unit is required." });
  const costRaw = cell("costPerUnit");
  if (costRaw && Number.isNaN(Number(costRaw))) {
    errors.push({ code: "COST_INVALID", message: "costPerUnit must be numeric when provided." });
  }
  if (name && unit && name.toLowerCase() === "water") {
    warnings.push({ code: "SANITY", message: "Verify cost basis for low-cost ingredients." });
  }
  if (errors.length) return { normalized: null, errors, warnings };
  return {
    normalized: {
      name,
      unit,
      category: cell("category") || undefined,
      supplier: cell("supplier") || undefined,
      costPerUnit: costRaw || undefined,
    },
    errors,
    warnings,
  };
}
