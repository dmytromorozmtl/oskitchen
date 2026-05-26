import type { IngredientDemandRow } from "./types";

export function groupDemandRowsBySupplier(rows: IngredientDemandRow[]): Map<string, IngredientDemandRow[]> {
  const m = new Map<string, IngredientDemandRow[]>();
  for (const r of rows) {
    const key = r.supplier?.trim() || "Unassigned supplier";
    const list = m.get(key) ?? [];
    list.push(r);
    m.set(key, list);
  }
  return m;
}

export type ShortageKind =
  | "BELOW_STOCK"
  | "NO_STOCK_DATA"
  | "NO_SUPPLIER"
  | "MISSING_COST"
  | "MISSING_CONVERSION"
  | "MISSING_RECIPE";

export type ShortageRow = IngredientDemandRow & { kind: ShortageKind };

export function classifyShortages(rows: IngredientDemandRow[]): ShortageRow[] {
  const out: ShortageRow[] = [];
  for (const r of rows) {
    if (r.conversionRequired) {
      out.push({ ...r, kind: "MISSING_CONVERSION" });
      continue;
    }
    if (r.shortage > 0) {
      const kind: ShortageKind =
        !r.supplier?.trim() ? "NO_SUPPLIER" : r.estimatedCost == null ? "MISSING_COST" : "BELOW_STOCK";
      out.push({ ...r, kind });
    }
  }
  return out;
}
