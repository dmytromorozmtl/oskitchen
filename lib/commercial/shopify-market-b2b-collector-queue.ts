export const SHOPIFY_MARKET_B2B_COLLECTOR_QUEUE_HONESTY =
  "Per-company collector tasks with SLA due dates and daily digest — operator reminders only, separate from legal dunning and buyer pay portal.";

/** Default max past-due days before a company task is SLA-breached. */
export const DEFAULT_B2B_COLLECTOR_SLA_DAYS = 45;

/** Default snooze duration when operator snoozes a task. */
export const DEFAULT_B2B_COLLECTOR_SNOOZE_DAYS = 7;

/** Minimum interval between daily collector digests (ms). */
export const B2B_COLLECTOR_DIGEST_MIN_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function isShopifyMarketsB2bCollectorQueueEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_B2B_AR_COLLECTOR_QUEUE === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function resolveB2bCollectorDigestEnabled(configured: boolean | null | undefined): boolean {
  return configured !== false;
}

export function resolveB2bCollectorSlaDays(
  companyAccountId: string | null | undefined,
  slaByCompany: Record<string, number> | null | undefined,
  configuredDefault: number | null | undefined,
): number {
  const fallback =
    typeof configuredDefault === "number" && configuredDefault > 0
      ? configuredDefault
      : DEFAULT_B2B_COLLECTOR_SLA_DAYS;
  if (companyAccountId && slaByCompany?.[companyAccountId] != null) {
    const perCompany = slaByCompany[companyAccountId];
    if (Number.isFinite(perCompany) && perCompany > 0) return perCompany;
  }
  return fallback;
}

export function shouldSendB2bCollectorDigest(
  lastDigestAt: string | null | undefined,
  nowMs = Date.now(),
): boolean {
  if (!lastDigestAt) return true;
  const lastMs = new Date(lastDigestAt).getTime();
  if (!Number.isFinite(lastMs)) return true;
  return nowMs - lastMs >= B2B_COLLECTOR_DIGEST_MIN_INTERVAL_MS;
}
