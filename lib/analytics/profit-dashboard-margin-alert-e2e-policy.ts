/**
 * Profit dashboard → margin alert accuracy E2E policy (QA-22).
 *
 * @see e2e/profit-dashboard-margin-alert.spec.ts
 * @see app/dashboard/today/profit/page.tsx
 * @see services/analytics/profit-alerts.ts
 */

/** Matches QA-09 COGS margin accuracy tolerance (±1%). */
export const MARGIN_ALERT_ACCURACY_TOLERANCE_PERCENT = 1.0;

export const PROFIT_DASHBOARD_MARGIN_ALERT_E2E_POLICY_ID =
  "profit-dashboard-margin-alert-e2e-v1" as const;

export const PROFIT_DASHBOARD_PATH = "/dashboard/today/profit" as const;
export const REAL_TIME_PROFIT_API_PATH = "/api/analytics/real-time-profit" as const;

export const PROFIT_DASHBOARD_TESTID = "real-time-profit-dashboard" as const;
export const PROFIT_MARGIN_GAUGE_TESTID = "profit-margin-gauge" as const;
export const PROFIT_ALERTS_TESTID = "profit-alerts" as const;
export const PROFIT_TOTAL_TESTID = "profit-total" as const;

export const PROFIT_DASHBOARD_HEADING_PATTERN = /Real-time profit/i;
export const PROFIT_REFRESH_SECONDS = 60 as const;

export type ProfitMarginAlertId =
  | "margin_drop"
  | "labor_spike"
  | "delivery_cost"
  | "food_cost"
  | "supplier_savings"
  | "peak_hours"
  | "margin_healthy";

export function marginPercentWithinTolerance(
  actual: number,
  expected: number,
  tolerance = MARGIN_ALERT_ACCURACY_TOLERANCE_PERCENT,
): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

export function extractMarginPercentsFromText(text: string): number[] {
  const matches = text.match(/(\d+(?:\.\d+)?)\s*%/g);
  if (!matches) return [];
  return matches.map((token) => parseFloat(token.replace("%", "").trim()));
}

export function parseGaugeMarginPercent(ariaLabel: string): number | null {
  const match = ariaLabel.match(/Margin gauge\s+([\d.]+)\s+percent/i);
  if (!match?.[1]) return null;
  const parsed = parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function marginAlertReferencesSnapshotMargin(
  alertId: string,
  message: string,
  snapshotMarginPercent: number,
): boolean {
  if (alertId !== "margin_drop" && alertId !== "margin_healthy") {
    return true;
  }
  const percents = extractMarginPercentsFromText(message);
  return percents.some((value) =>
    marginPercentWithinTolerance(value, snapshotMarginPercent, 0.5),
  );
}

export function displayedGaugeMarginMatchesSnapshot(
  gaugeMarginPercent: number,
  snapshotMarginPercent: number,
): boolean {
  return marginPercentWithinTolerance(gaugeMarginPercent, snapshotMarginPercent, 1.5);
}
