import { subDays } from "date-fns";

import {
  buildActualDepletionRows,
  buildActualVsTheoreticalVarianceDemoReport,
  buildActualVsTheoreticalVarianceReport,
  buildAvtVarianceTile,
  buildTheoreticalBaselineRows,
  type ActualVsTheoreticalVarianceReport,
} from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-operations";
import { ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID } from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-policy";
import { summarizeActualVsTheoretical } from "@/services/costing/actual-vs-theoretical-service";
import { loadAvtReport } from "@/services/costing/avt-report-service";
import { summarizeCostingVarianceAlerts } from "@/services/costing/costing-alert-service";

export type ActualVsTheoreticalVarianceSnapshot = ActualVsTheoreticalVarianceReport & {
  policyId: typeof ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID;
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadActualVsTheoreticalVarianceSnapshot(
  userId: string,
): Promise<ActualVsTheoreticalVarianceSnapshot> {
  try {
    const [workspaceSummary, alertSummary, avtReport] = await Promise.all([
      summarizeActualVsTheoretical(userId),
      summarizeCostingVarianceAlerts(userId),
      loadAvtReport(userId, { from: subDays(new Date(), 30), to: new Date() }),
    ]);

    const hasLiveData =
      workspaceSummary.recipeCount > 0 ||
      alertSummary.count > 0 ||
      avtReport.rows.length > 0;

    if (hasLiveData) {
      const theoreticalBaseline = buildTheoreticalBaselineRows(
        avtReport.rows
          .filter((row) => row.theoreticalIngredientCostPerUnit != null && row.soldQuantity > 0)
          .map((row) => ({
            productId: row.productId,
            productName: row.title,
            theoreticalCostPerUnit: row.theoreticalIngredientCostPerUnit!,
            soldQuantity: row.soldQuantity,
            confidence: row.confidence,
            recipeCoverage: row.recipeCoverage,
          })),
      );

      const actualDepletion = buildActualDepletionRows(
        alertSummary.topAlerts.map((alert) => ({
          productId: alert.productId,
          productName: alert.productName,
          theoreticalCost: alert.theoreticalCost,
          actualCost: alert.actualCost,
          variancePercent: alert.variancePercent,
          source: alert.source,
          theftScore: alert.theftScore,
        })),
      );

      const avgDrift =
        actualDepletion.length > 0
          ? actualDepletion.reduce((sum, row) => sum + row.variancePercent, 0) /
            actualDepletion.length
          : 0;

      const varianceTile = buildAvtVarianceTile({
        driftPercent: avgDrift,
        alertCount: alertSummary.count,
        theftAlertCount: alertSummary.theftAlerts.length,
        confidence: workspaceSummary.confidence,
      });

      const report = buildActualVsTheoreticalVarianceReport({
        varianceTile,
        theoreticalBaseline,
        actualDepletion,
      });

      return {
        policyId: ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
        ...report,
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildActualVsTheoreticalVarianceDemoReport();

  return {
    policyId: ACTUAL_VS_THEORETICAL_VARIANCE_P2_102_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
    ...report,
  };
}
