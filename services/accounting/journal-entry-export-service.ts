import {
  applyCoaMappingsToJournalEntries,
  JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID,
  journalEntriesToExportCsv,
  journalEntriesToExportJson,
  journalEntriesToQuickBooksCsv,
  summarizeJournalEntryExport,
  type JournalEntryExportFormat,
  type JournalEntryExportModel,
} from "@/lib/accounting/journal-entry-export-absolute-final-policy";
import { loadCoaMappingRows } from "@/lib/accounting/chart-of-accounts-mapping-storage";
import { loadGlDepthAccountingModel } from "@/services/accounting/gl-depth-accounting-service";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

export async function loadJournalEntryExportModel(
  userId: string,
  period: PnlPeriod,
  canExport: boolean,
): Promise<JournalEntryExportModel> {
  const [glModel, mappings] = await Promise.all([
    loadGlDepthAccountingModel(userId, period),
    loadCoaMappingRows(userId),
  ]);

  const entries = applyCoaMappingsToJournalEntries(glModel.journalEntries, mappings);

  return {
    policyId: JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID,
    period,
    periodLabel: glModel.periodLabel,
    entries,
    summary: summarizeJournalEntryExport(entries),
    canExport,
    refreshedAt: new Date().toISOString(),
  };
}

export async function exportJournalEntries(
  userId: string,
  period: PnlPeriod,
  format: JournalEntryExportFormat,
): Promise<string> {
  const model = await loadJournalEntryExportModel(userId, period, true);

  if (format === "json") {
    return journalEntriesToExportJson(model.entries, {
      period: model.period,
      periodLabel: model.periodLabel,
      exportedAt: model.refreshedAt,
    });
  }

  if (format === "quickbooks_csv") {
    return journalEntriesToQuickBooksCsv(model.entries);
  }

  return journalEntriesToExportCsv(model.entries);
}
