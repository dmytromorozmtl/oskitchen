import {
  buildInventoryVarianceReport,
  buildTheftSpoilageRows,
  buildWasteTrackingRows,
  INVENTORY_VARIANCE_REPORT_DEMO_FIXTURE,
  type InventoryVarianceReport,
} from "@/lib/inventory/inventory-variance-report-p2-99-operations";
import { INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID } from "@/lib/inventory/inventory-variance-report-p2-99-policy";
import { loadInventoryManagerSnapshot } from "@/services/ai/inventory-manager";

export type InventoryVarianceReportSnapshot = InventoryVarianceReport & {
  policyId: typeof INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID;
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadInventoryVarianceReportSnapshot(
  userId: string,
): Promise<InventoryVarianceReportSnapshot> {
  try {
    const manager = await loadInventoryManagerSnapshot(userId);
    const hasSignals =
      manager.wasteSignals.length > 0 ||
      manager.theftSignals.length > 0 ||
      manager.shrinkageSignals.length > 0;

    if (hasSignals) {
      const expectedVsActual = manager.shrinkageSignals.map((signal) => ({
        ingredientId: signal.countId,
        ingredientName: `Count ${signal.countDateIso.slice(0, 10)}`,
        unit: "lines",
        expectedQty: signal.linesWithVariance,
        actualQty: 0,
        varianceQty: -signal.linesWithVariance,
        varianceCost: signal.shrinkCost,
        variancePercent: 0,
      }));

      const report = buildInventoryVarianceReport({
        expectedVsActual,
        theftSpoilage: buildTheftSpoilageRows(manager.theftSignals, manager.wasteSignals),
        wasteTracking: buildWasteTrackingRows(manager.wasteSignals),
      });

      return {
        policyId: INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID,
        mode: "live",
        analyzedAt: manager.generatedAtIso,
        ...report,
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildInventoryVarianceReport({
    expectedVsActual: [...INVENTORY_VARIANCE_REPORT_DEMO_FIXTURE.expectedVsActual],
    theftSpoilage: [...INVENTORY_VARIANCE_REPORT_DEMO_FIXTURE.theftSpoilage],
    wasteTracking: [...INVENTORY_VARIANCE_REPORT_DEMO_FIXTURE.wasteTracking],
  });

  return {
    policyId: INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
    ...report,
  };
}
