import type { IngredientDemandSettings } from "./settings";

/**
 * Global buffer multiplier (e.g. 5 → 1.05) with optional per-ingredient override replacing global for that SKU.
 */
export function resolveGlobalBufferMultiplier(
  settings: IngredientDemandSettings,
  ingredientId: string,
): number {
  const pct =
    settings.ingredientWasteBufferPercentById[ingredientId] ?? settings.globalWasteBufferPercent;
  const safe = Math.max(0, Math.min(100, pct));
  return 1 + safe / 100;
}

export function applyBatchRounding(qty: number, mode: IngredientDemandSettings["batchRounding"]): number {
  if (!Number.isFinite(qty)) return qty;
  if (mode === "ceil") return Math.ceil(qty);
  if (mode === "floor") return Math.floor(qty);
  return qty;
}
