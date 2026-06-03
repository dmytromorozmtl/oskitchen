import { expect, type APIRequestContext, type Page } from "@playwright/test";

import {
  MARGIN_ALERT_ACCURACY_TOLERANCE_PERCENT,
  PROFIT_ALERTS_TESTID,
  PROFIT_DASHBOARD_PATH,
  PROFIT_DASHBOARD_TESTID,
  PROFIT_MARGIN_GAUGE_TESTID,
  PROFIT_REFRESH_SECONDS,
  REAL_TIME_PROFIT_API_PATH,
  displayedGaugeMarginMatchesSnapshot,
  marginAlertReferencesSnapshotMargin,
  parseGaugeMarginPercent,
} from "@/lib/analytics/profit-dashboard-margin-alert-e2e-policy";
import { marginZone } from "@/services/analytics/profit-alerts";
import type { RealTimeProfitSnapshot } from "@/services/analytics/real-time-profit-service";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type ProfitDashboardMarginAlertFlowResult = {
  snapshot: RealTimeProfitSnapshot;
  gaugeMarginPercent: number;
  alertsVisible: boolean;
  alertCount: number;
};

export async function fetchRealTimeProfitSnapshot(
  request: APIRequestContext,
): Promise<RealTimeProfitSnapshot | null> {
  const response = await request.get(REAL_TIME_PROFIT_API_PATH);
  if (response.status() === 401) {
    return null;
  }
  expect(response.ok()).toBe(true);
  return (await response.json()) as RealTimeProfitSnapshot;
}

export async function runProfitDashboardMarginAlertFlow(
  page: Page,
): Promise<ProfitDashboardMarginAlertFlowResult | null> {
  await page.goto(PROFIT_DASHBOARD_PATH);
  await skipIfLoginRedirect(page, "Profit dashboard margin alert requires dashboard auth");

  if (!page.url().includes(PROFIT_DASHBOARD_PATH)) {
    return null;
  }

  await expect(page.getByTestId(PROFIT_DASHBOARD_TESTID)).toBeVisible({ timeout: 30_000 });
  await assertNoDashboardRscFailure(page);

  const snapshot = await fetchRealTimeProfitSnapshot(page.request);
  if (!snapshot) {
    return null;
  }

  expect(snapshot.refreshSeconds).toBe(PROFIT_REFRESH_SECONDS);
  expect(snapshot.marginZone).toBe(marginZone(snapshot.marginPercent));

  const gauge = page.getByTestId(PROFIT_MARGIN_GAUGE_TESTID);
  await expect(gauge).toBeVisible();
  const ariaLabel = (await gauge.getAttribute("aria-label")) ?? "";
  const gaugeMargin = parseGaugeMarginPercent(ariaLabel);
  expect(gaugeMargin).not.toBeNull();
  expect(displayedGaugeMarginMatchesSnapshot(gaugeMargin!, snapshot.marginPercent)).toBe(true);

  for (const alert of snapshot.alerts) {
    expect(
      marginAlertReferencesSnapshotMargin(alert.id, alert.message, snapshot.marginPercent),
      `Alert ${alert.id} margin text should match snapshot within ±${MARGIN_ALERT_ACCURACY_TOLERANCE_PERCENT}%`,
    ).toBe(true);
  }

  const alertsLocator = page.getByTestId(PROFIT_ALERTS_TESTID);
  const alertsVisible = (await alertsLocator.count()) > 0;
  if (snapshot.alerts.length > 0) {
    await expect(alertsLocator).toBeVisible();
    for (const alert of snapshot.alerts) {
      await expect(alertsLocator.getByText(alert.title)).toBeVisible();
    }
  }

  return {
    snapshot,
    gaugeMarginPercent: gaugeMargin!,
    alertsVisible,
    alertCount: snapshot.alerts.length,
  };
}
