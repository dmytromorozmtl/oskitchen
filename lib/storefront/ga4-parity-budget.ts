import {
  GA4_PARITY_DRIFT_THRESHOLD_PP,
  type Ga4ParityHistoryPoint,
} from "@/lib/storefront/ga4-parity-json";

export type Ga4ParityErrorBudget = {
  windowDays: number;
  budgetDays: number;
  driftDays: number;
  remainingDays: number;
  burnPercent: number;
  status: "healthy" | "warning" | "exhausted";
  headline: string;
  detail: string;
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Error budget: count calendar days with parity drift in the rolling window.
 * Default budget = 3 drift-days per 30d window.
 */
export function computeGa4ParityErrorBudget(
  history: Ga4ParityHistoryPoint[],
  input?: { windowDays?: number; budgetDays?: number },
): Ga4ParityErrorBudget {
  const windowDays = input?.windowDays ?? 30;
  const budgetDays = input?.budgetDays ?? 3;
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;

  const driftDaySet = new Set<string>();
  for (const p of history) {
    if (new Date(p.at).getTime() < cutoff) continue;
    const isDrift =
      p.status === "drift" ||
      (p.parityScorePp !== null && p.parityScorePp > GA4_PARITY_DRIFT_THRESHOLD_PP);
    if (isDrift) driftDaySet.add(dayKey(p.at));
  }

  const driftDays = driftDaySet.size;
  const remainingDays = Math.max(0, budgetDays - driftDays);
  const burnPercent = budgetDays > 0 ? Math.round((driftDays / budgetDays) * 100) : 0;

  let status: Ga4ParityErrorBudget["status"] = "healthy";
  if (driftDays >= budgetDays) status = "exhausted";
  else if (driftDays >= budgetDays - 1) status = "warning";

  const headline =
    status === "exhausted"
      ? `Parity budget exhausted — ${driftDays}/${budgetDays} drift days (${windowDays}d)`
      : status === "warning"
        ? `Parity budget low — ${remainingDays} drift day(s) left`
        : `Parity budget healthy — ${remainingDays} drift day(s) remaining`;

  const detail =
    status === "exhausted"
      ? "Pause Apply winner / auto-conclude until GA4 and first-party align. Investigate tagging and bots."
      : `Rolling ${windowDays}d window: ${driftDays} calendar day(s) exceeded ${GA4_PARITY_DRIFT_THRESHOLD_PP} pp threshold.`;

  return {
    windowDays,
    budgetDays,
    driftDays,
    remainingDays,
    burnPercent,
    status,
    headline,
    detail,
  };
}
