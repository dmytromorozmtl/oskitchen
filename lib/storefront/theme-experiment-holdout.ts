export const DEFAULT_POST_WINNER_HOLDOUT_PERCENT = 0;

export function readPostWinnerHoldoutPercent(raw: unknown): number {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_POST_WINNER_HOLDOUT_PERCENT;
  const v = (raw as Record<string, unknown>).postWinnerHoldoutPercent;
  if (typeof v !== "number" || !Number.isFinite(v)) return DEFAULT_POST_WINNER_HOLDOUT_PERCENT;
  return Math.min(20, Math.max(0, Math.floor(v)));
}

/** After winner shipped: keep small % on published for incremental lift measurement. */
export function isPostWinnerHoldoutActive(raw: unknown): boolean {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const o = raw as Record<string, unknown>;
  if (o.enabled === true) return false;
  const holdout = readPostWinnerHoldoutPercent(raw);
  return holdout > 0 && typeof o.concludedAt === "string";
}
