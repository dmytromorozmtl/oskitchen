import {
  ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID,
  buildAccountantPortalDeliverables,
  summarizeAccountantPortal,
  type AccountantPortalModel,
} from "@/lib/accounting/accountant-portal-absolute-final-policy";
import { summarizeCoaMappingCoverage } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import { loadCoaMappingRows } from "@/lib/accounting/chart-of-accounts-mapping-storage";
import { loadGlDepthAccountingModel } from "@/services/accounting/gl-depth-accounting-service";
import { loadPnlReconciliationViewModel } from "@/services/accounting/pnl-reconciliation-view-service";
import { getQuickBooksCredentialsForUser } from "@/services/integrations/quickbooks/quickbooks-credentials";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

const PERIOD_LABELS: Record<PnlPeriod, string> = {
  today: "Daily",
  week: "Weekly",
  month: "Monthly",
  quarter: "Quarterly",
  year: "Annual",
};

export async function loadAccountantPortalModel(
  userId: string,
  period: PnlPeriod,
  canExport: boolean,
): Promise<AccountantPortalModel> {
  const [glModel, coaMappings, reconciliation, creds] = await Promise.all([
    loadGlDepthAccountingModel(userId, period),
    loadCoaMappingRows(userId),
    loadPnlReconciliationViewModel(userId, period, canExport),
    getQuickBooksCredentialsForUser(userId),
  ]);

  const coaSummary = summarizeCoaMappingCoverage(coaMappings);
  const deliverables = buildAccountantPortalDeliverables({
    coaCoveragePercent: coaSummary.coveragePercent,
    reconciliationPercent: reconciliation.summary.reconciliationPercent,
    materialVarianceCount: reconciliation.summary.materialVarianceCount,
    journalEntryCount: glModel.summary.journalEntryCount,
    quickBooksConnected: Boolean(creds),
    balanced: glModel.summary.balanced,
  });

  return {
    policyId: ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID,
    period,
    periodLabel: PERIOD_LABELS[period],
    deliverables,
    summary: summarizeAccountantPortal(deliverables, {
      coaCoveragePercent: coaSummary.coveragePercent,
      reconciliationPercent: reconciliation.summary.reconciliationPercent,
      materialVarianceCount: reconciliation.summary.materialVarianceCount,
      journalEntryCount: glModel.summary.journalEntryCount,
      quickBooksConnected: Boolean(creds),
      canExport,
    }),
    refreshedAt: new Date().toISOString(),
  };
}
