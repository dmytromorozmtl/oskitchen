import {
  enrichPnlReconciliationRows,
  PNL_RECONCILIATION_VIEW_ABSOLUTE_FINAL_POLICY_ID,
  pnlReconciliationViewToCsv,
  summarizePnlReconciliationView,
  type PnlReconciliationViewModel,
} from "@/lib/accounting/pnl-reconciliation-view-absolute-final-policy";
import { loadGlDepthAccountingModel } from "@/services/accounting/gl-depth-accounting-service";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

export async function loadPnlReconciliationViewModel(
  userId: string,
  period: PnlPeriod,
  canExport: boolean,
): Promise<PnlReconciliationViewModel> {
  const glModel = await loadGlDepthAccountingModel(userId, period);
  const rows = enrichPnlReconciliationRows(glModel.pnlReconciliation);

  return {
    policyId: PNL_RECONCILIATION_VIEW_ABSOLUTE_FINAL_POLICY_ID,
    period,
    periodLabel: glModel.periodLabel,
    rows,
    summary: summarizePnlReconciliationView(rows),
    canExport,
    refreshedAt: new Date().toISOString(),
  };
}

export async function exportPnlReconciliationCsv(
  userId: string,
  period: PnlPeriod,
): Promise<string> {
  const model = await loadPnlReconciliationViewModel(userId, period, true);
  return pnlReconciliationViewToCsv(model.rows);
}
