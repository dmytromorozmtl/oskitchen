/**
 * Today page focus when Owner Daily Briefing is active — Era 19 Cycle 2.
 * Collapses redundant KPI wall and duplicate attention strips for owner/manager scan speed.
 */

export const OWNER_DAILY_BRIEFING_TODAY_FOCUS_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-today-focus-v1" as const;

/** Briefing owns primary metrics — collapse the legacy KPI wall unless explicitly expanded. */
export function shouldCollapseTodayMetricsForBriefing(input: {
  briefingActive: boolean;
  showFullMetrics: boolean;
}): boolean {
  return input.briefingActive && !input.showFullMetrics;
}

/** Briefing manager alerts replace the Era 18 Today attention strip. */
export function shouldHideTodayAttentionStripForBriefing(briefingActive: boolean): boolean {
  return briefingActive;
}

/** Briefing hero includes go-live readiness — compact the duplicate readiness card. */
export function shouldCompactTodayReadinessForBriefing(input: {
  briefingActive: boolean;
  showFullMetrics: boolean;
}): boolean {
  return input.briefingActive && !input.showFullMetrics;
}

export function resolveTodayMetricsExpandHref(showFullMetrics: boolean): string {
  return showFullMetrics ? "/dashboard/today" : "/dashboard/today?metrics=all";
}

export function todayMetricsExpandLabel(showFullMetrics: boolean): string {
  return showFullMetrics ? "Hide full metrics" : "View full metrics";
}
