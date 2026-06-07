/**
 * Absolute Final Task 97 — journal entry export.
 *
 * @see app/dashboard/accounting/journal-export/page.tsx
 * @see components/dashboard/accounting/journal-entry-export-panel.tsx
 */

import type { GlJournalEntry } from "@/lib/accounting/gl-depth-accounting-policy";
import type { CoaMappingRow } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

export const JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID =
  "journal-entry-export-absolute-final-v1" as const;

export const JOURNAL_ENTRY_EXPORT_ROUTE = "/dashboard/accounting/journal-export" as const;

export const JOURNAL_ENTRY_EXPORT_PAGE_PATH =
  "app/dashboard/accounting/journal-export/page.tsx" as const;

export const JOURNAL_ENTRY_EXPORT_COMPONENT_PATH =
  "components/dashboard/accounting/journal-entry-export-panel.tsx" as const;

export const JOURNAL_ENTRY_EXPORT_SERVICE_PATH =
  "services/accounting/journal-entry-export-service.ts" as const;

export const JOURNAL_ENTRY_EXPORT_CONTENT_PATH =
  "lib/accounting/journal-entry-export-content.ts" as const;

export const JOURNAL_ENTRY_EXPORT_STRIP_PATH =
  "components/dashboard/accounting/journal-entry-export-strip.tsx" as const;

export const JOURNAL_ENTRY_EXPORT_GL_SYNC_PAGE =
  "app/dashboard/accounting/gl-sync/page.tsx" as const;

export const JOURNAL_ENTRY_EXPORT_CSV_ROUTE = "/api/export/gl-journal" as const;

export const JOURNAL_ENTRY_EXPORT_JSON_ROUTE = "/api/export/gl-journal/json" as const;

export const JOURNAL_ENTRY_EXPORT_FORMATS = ["csv", "json", "quickbooks_csv"] as const;

export type JournalEntryExportFormat = (typeof JOURNAL_ENTRY_EXPORT_FORMATS)[number];

export type JournalEntryExportLine = {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  pnlLineKey: string | null;
  externalAccountId: string | null;
  externalAccountName: string | null;
};

export type JournalEntryExportEntry = {
  id: string;
  date: string;
  memo: string;
  pnlLineKey: string;
  lines: JournalEntryExportLine[];
};

export type JournalEntryExportSummary = {
  entryCount: number;
  lineCount: number;
  totalDebits: number;
  totalCredits: number;
  balanced: boolean;
  mappedLineCount: number;
};

export type JournalEntryExportModel = {
  policyId: typeof JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID;
  period: PnlPeriod;
  periodLabel: string;
  entries: JournalEntryExportEntry[];
  summary: JournalEntryExportSummary;
  canExport: boolean;
  refreshedAt: string;
};

export const JOURNAL_ENTRY_EXPORT_REQUIRED_MARKERS = [
  'data-testid="journal-entry-export-panel"',
  "JournalEntryExportPanel",
] as const;

export const JOURNAL_ENTRY_EXPORT_HONESTY_MARKERS = [
  "BETA",
  "accountant review",
  "not a certified GL",
  "QuickBooks",
  "Do not claim",
] as const;

export const JOURNAL_ENTRY_EXPORT_WIRING_PATHS = [
  JOURNAL_ENTRY_EXPORT_PAGE_PATH,
  JOURNAL_ENTRY_EXPORT_COMPONENT_PATH,
  JOURNAL_ENTRY_EXPORT_SERVICE_PATH,
  JOURNAL_ENTRY_EXPORT_CONTENT_PATH,
  JOURNAL_ENTRY_EXPORT_STRIP_PATH,
  JOURNAL_ENTRY_EXPORT_GL_SYNC_PAGE,
  "app/api/export/gl-journal/json/route.ts",
  "lib/accounting/journal-entry-export-absolute-final-policy.ts",
  "lib/accounting/journal-entry-export-audit.ts",
  "tests/unit/journal-entry-export-absolute-final.test.ts",
] as const;

export const JOURNAL_ENTRY_EXPORT_UNIT_TEST =
  "tests/unit/journal-entry-export-absolute-final.test.ts" as const;

export const JOURNAL_ENTRY_EXPORT_CI_SCRIPTS = [
  "test:ci:journal-entry-export",
  "test:ci:journal-entry-export:cert",
] as const;

export function roundExportMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function applyCoaMappingsToJournalEntries(
  entries: readonly GlJournalEntry[],
  mappings: readonly CoaMappingRow[],
): JournalEntryExportEntry[] {
  const byKey = new Map(mappings.map((m) => [m.pnlLineKey, m]));

  return entries.map((entry) => {
    const mapping = byKey.get(entry.pnlLineKey);
    return {
      id: entry.id,
      date: entry.date,
      memo: entry.memo,
      pnlLineKey: entry.pnlLineKey,
      lines: entry.lines.map((line) => {
        const useMapping = line.pnlLineKey === entry.pnlLineKey && mapping;
        return {
          accountCode: useMapping ? mapping.glAccountCode : line.accountCode,
          accountName: useMapping ? mapping.glAccountName : line.accountName,
          debit: line.debit,
          credit: line.credit,
          pnlLineKey: line.pnlLineKey,
          externalAccountId: useMapping ? mapping.externalAccountId : null,
          externalAccountName: useMapping ? mapping.externalAccountName : null,
        };
      }),
    };
  });
}

export function summarizeJournalEntryExport(
  entries: readonly JournalEntryExportEntry[],
): JournalEntryExportSummary {
  let totalDebits = 0;
  let totalCredits = 0;
  let lineCount = 0;
  let mappedLineCount = 0;

  for (const entry of entries) {
    for (const line of entry.lines) {
      lineCount += 1;
      totalDebits += line.debit;
      totalCredits += line.credit;
      if (line.externalAccountId) mappedLineCount += 1;
    }
  }

  totalDebits = roundExportMoney(totalDebits);
  totalCredits = roundExportMoney(totalCredits);

  return {
    entryCount: entries.length,
    lineCount,
    totalDebits,
    totalCredits,
    balanced: Math.abs(totalDebits - totalCredits) <= 0.01,
    mappedLineCount,
  };
}

export function journalEntriesToExportCsv(entries: readonly JournalEntryExportEntry[]): string {
  const header =
    "Date,Memo,Account Code,Account Name,Debit,Credit,P&L Line,QuickBooks Account ID,QuickBooks Account Name";
  const rows: string[] = [header];

  for (const entry of entries) {
    for (const line of entry.lines) {
      rows.push(
        [
          entry.date,
          `"${entry.memo.replace(/"/g, '""')}"`,
          line.accountCode,
          `"${line.accountName.replace(/"/g, '""')}"`,
          line.debit.toFixed(2),
          line.credit.toFixed(2),
          entry.pnlLineKey,
          line.externalAccountId ?? "",
          line.externalAccountName ? `"${line.externalAccountName.replace(/"/g, '""')}"` : "",
        ].join(","),
      );
    }
  }

  return rows.join("\n");
}

export function journalEntriesToQuickBooksCsv(entries: readonly JournalEntryExportEntry[]): string {
  const header = "Date,Memo,Account,Debit,Credit,QuickBooks Account ID";
  const rows: string[] = [header];

  for (const entry of entries) {
    for (const line of entry.lines) {
      const accountLabel = line.externalAccountName
        ? `${line.externalAccountName} (${line.accountCode})`
        : `${line.accountName} (${line.accountCode})`;
      rows.push(
        [
          entry.date,
          `"${entry.memo.replace(/"/g, '""')}"`,
          `"${accountLabel.replace(/"/g, '""')}"`,
          line.debit.toFixed(2),
          line.credit.toFixed(2),
          line.externalAccountId ?? "",
        ].join(","),
      );
    }
  }

  return rows.join("\n");
}

export function journalEntriesToExportJson(
  entries: readonly JournalEntryExportEntry[],
  meta: { period: PnlPeriod; periodLabel: string; exportedAt: string },
): string {
  const summary = summarizeJournalEntryExport(entries);
  return JSON.stringify(
    {
      policyId: JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID,
      exportedAt: meta.exportedAt,
      period: meta.period,
      periodLabel: meta.periodLabel,
      summary,
      entries,
      disclaimer:
        "BETA export from operational P&L — not a certified GL. Accountant review required before posting.",
    },
    null,
    2,
  );
}
