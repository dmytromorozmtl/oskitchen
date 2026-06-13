import { suggestReorderQuantity } from "@/lib/purchasing/reorder-rules";

import { PAR_LEVELS_AUTO_REORDER_P2_43_POLICY_ID } from "@/lib/inventory/par-levels-auto-reorder-p2-43-policy";

export type ParLevelIngredientLike = {
  currentStock: number;
  parLevel: number;
  reorderPoint?: number | null;
};

/** True when par is configured and on-hand stock is below target. */
export function isBelowParLevel(ingredient: ParLevelIngredientLike): boolean {
  const par = Number(ingredient.parLevel);
  if (par <= 0) return false;
  return Number(ingredient.currentStock) < par;
}

/** Quantity needed to reach par (ignores demand shortage). */
export function computeParGapQuantity(ingredient: ParLevelIngredientLike): number {
  const par = Number(ingredient.parLevel);
  const stock = Number(ingredient.currentStock);
  return Math.max(0, par - stock);
}

/** Suggested purchase qty for par replenishment (respects reorder point floor when set). */
export function suggestParReplenishmentQuantity(ingredient: ParLevelIngredientLike): number {
  const parGap = computeParGapQuantity(ingredient);
  if (parGap <= 0) return 0;

  const reorderPoint = ingredient.reorderPoint;
  const shortageFromReorder =
    reorderPoint != null ? Math.max(0, Number(reorderPoint) - Number(ingredient.currentStock)) : 0;

  return suggestReorderQuantity({
    shortage: shortageFromReorder,
    parLevel: ingredient.parLevel,
    currentStock: ingredient.currentStock,
  });
}

export function urgencyFromParGap(parGap: number, leadTimeDays = 7): string {
  if (parGap <= 0) return "low";
  if (leadTimeDays <= 2) return "critical";
  if (leadTimeDays <= 5) return "high";
  return "normal";
}

export function buildParReplenishmentSourceId(ingredientId: string): string {
  return `par-level:${ingredientId}`;
}

export function defaultParRequiredByDate(now = new Date(), leadTimeDays = 7): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + Math.max(1, leadTimeDays));
  return d;
}

export { PAR_LEVELS_AUTO_REORDER_P2_43_POLICY_ID };
