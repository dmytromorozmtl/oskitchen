export const SHOPIFY_MARKET_B2B_DUNNING_HONESTY =
  "Weekly operator AR digests and optional day-35/day-65 auto-reminders for overdue B2B invoices — no legal escalation or buyer payment portal.";

export const DEFAULT_B2B_DUNNING_CADENCE_DAYS = [35, 65] as const;

export const B2B_OPERATOR_DIGEST_MIN_INTERVAL_MS = 7 * 86400000;

export function isShopifyMarketsB2bDunningEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_DUNNING === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function resolveB2bAutoDunningEnabled(configured: boolean | null | undefined): boolean {
  return configured === true;
}

export function resolveB2bOperatorDigestEnabled(configured: boolean | null | undefined): boolean {
  return configured !== false;
}

export function resolveB2bDunningCadenceDays(configured: number[] | null | undefined): number[] {
  if (Array.isArray(configured) && configured.length > 0) {
    return [...new Set(configured.filter((d) => Number.isFinite(d) && d > 0))].sort((a, b) => a - b);
  }
  return [...DEFAULT_B2B_DUNNING_CADENCE_DAYS];
}

export function shouldSendB2bOperatorDigest(
  lastDigestAt: string | null | undefined,
  nowMs = Date.now(),
): boolean {
  if (!lastDigestAt) return true;
  const lastMs = new Date(lastDigestAt).getTime();
  if (!Number.isFinite(lastMs)) return true;
  return nowMs - lastMs >= B2B_OPERATOR_DIGEST_MIN_INTERVAL_MS;
}
