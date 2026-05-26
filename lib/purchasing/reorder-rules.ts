/**
 * Suggested purchase quantity from operational signals.
 * Does not replace buyer judgment — caps at reasonable multiple of shortage when par data exists.
 */
export function suggestReorderQuantity(params: {
  shortage: number;
  parLevel: number;
  currentStock: number;
  minimumQuantity?: number | null;
}): number {
  const { shortage, parLevel, currentStock } = params;
  const parGap = Math.max(0, Number(parLevel) - Number(currentStock));
  const base = Math.max(shortage, parGap);
  const minQ = params.minimumQuantity != null ? Math.max(Number(params.minimumQuantity), 0) : 0;
  return Math.max(base, minQ, 0);
}

export function urgencyFromShortageAndDate(shortage: number, requiredBy: Date, now = new Date()): string {
  if (shortage <= 0) return "low";
  const days = (requiredBy.getTime() - now.getTime()) / 86400000;
  if (days < 1) return "critical";
  if (days < 3) return "high";
  return "normal";
}
