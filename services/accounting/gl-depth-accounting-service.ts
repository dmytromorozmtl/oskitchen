import {
  buildJournalEntriesFromPnlLines,
  GL_DEPTH_ACCOUNTING_POLICY_ID,
  journalEntriesToCsv,
  reconcilePnlWithJournal,
  summarizeGlDepthAccounting,
  type GlDepthAccountingSummary,
  type GlJournalEntry,
  type GlPnlReconciliationRow,
} from "@/lib/accounting/gl-depth-accounting-policy";
import {
  RESTAURANT_COA_TEMPLATE,
  type RestaurantCoaAccount,
} from "@/lib/accounting/restaurant-coa-template";
import {
  getRestaurantPnLStatement,
  type PnlPeriod,
} from "@/services/accounting/restaurant-pnl-service";

export type GlDepthAccountingModel = {
  policyId: typeof GL_DEPTH_ACCOUNTING_POLICY_ID;
  period: PnlPeriod;
  periodLabel: string;
  txnDate: string;
  chartOfAccounts: RestaurantCoaAccount[];
  journalEntries: GlJournalEntry[];
  pnlReconciliation: GlPnlReconciliationRow[];
  summary: GlDepthAccountingSummary;
};

const PERIOD_LABELS: Record<PnlPeriod, string> = {
  today: "Daily",
  week: "Weekly",
  month: "Monthly",
  quarter: "Quarterly",
  year: "Annual",
};

export async function loadGlDepthAccountingModel(
  userId: string,
  period: PnlPeriod = "month",
): Promise<GlDepthAccountingModel> {
  const { lines } = await getRestaurantPnLStatement(userId, period);
  const txnDate = new Date().toISOString().slice(0, 10);
  const periodLabel = PERIOD_LABELS[period];

  const journalEntries = buildJournalEntriesFromPnlLines(lines, { periodLabel, txnDate });
  const pnlReconciliation = reconcilePnlWithJournal(lines, journalEntries);
  const summary = summarizeGlDepthAccounting(journalEntries, pnlReconciliation);

  return {
    policyId: GL_DEPTH_ACCOUNTING_POLICY_ID,
    period,
    periodLabel,
    txnDate,
    chartOfAccounts: RESTAURANT_COA_TEMPLATE,
    journalEntries,
    pnlReconciliation,
    summary,
  };
}

export async function exportGlJournalCsv(userId: string, period: PnlPeriod): Promise<string> {
  const model = await loadGlDepthAccountingModel(userId, period);
  return journalEntriesToCsv(model.journalEntries);
}
