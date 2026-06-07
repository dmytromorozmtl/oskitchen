/**
 * Absolute Final Task 41 — GL-depth accounting sync (COA, journal, P&L reconciliation).
 */

import type { PnlLine } from "@/services/accounting/restaurant-pnl-service";

import { RESTAURANT_COA_TEMPLATE } from "./restaurant-coa-template";

export const GL_DEPTH_ACCOUNTING_POLICY_ID = "gl-depth-accounting-absolute-final-v1" as const;

export const GL_DEPTH_ACCOUNTING_PAGE_PATH = "app/dashboard/accounting/gl-sync/page.tsx" as const;

export const GL_DEPTH_ACCOUNTING_PANEL_PATH =
  "components/dashboard/accounting/gl-depth-sync-panel.tsx" as const;

export const GL_DEPTH_ACCOUNTING_SERVICE_PATH =
  "services/accounting/gl-depth-accounting-service.ts" as const;

export const GL_DEPTH_ACCOUNTING_ROUTE = "/dashboard/accounting/gl-sync" as const;

export const GL_DEPTH_ACCOUNTING_EXPORT_ROUTE = "/api/export/gl-journal" as const;

export const GL_DEPTH_ACCOUNTING_CI_SCRIPTS = ["test:ci:gl-depth-accounting"] as const;

export const GL_DEPTH_RECONCILIATION_TOLERANCE = 0.01;

export type GlJournalLine = {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  pnlLineKey: string | null;
};

export type GlJournalEntry = {
  id: string;
  date: string;
  memo: string;
  pnlLineKey: string;
  lines: GlJournalLine[];
};

export type GlPnlReconciliationRow = {
  pnlLineKey: string;
  label: string;
  statementAmount: number;
  journalAmount: number;
  variance: number;
  status: "synced" | "variance";
};

export type GlDepthAccountingSummary = {
  accountCount: number;
  journalEntryCount: number;
  syncedLineCount: number;
  varianceLineCount: number;
  totalDebits: number;
  totalCredits: number;
  balanced: boolean;
};

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Build balanced double-entry journal rows from operational P&L lines. */
export function buildJournalEntriesFromPnlLines(
  lines: PnlLine[],
  opts: { periodLabel: string; txnDate: string },
): GlJournalEntry[] {
  const entries: GlJournalEntry[] = [];
  const undeposited = RESTAURANT_COA_TEMPLATE.find((a) => a.code === "1000")!;
  const retained = RESTAURANT_COA_TEMPLATE.find((a) => a.code === "3000")!;
  const ap = RESTAURANT_COA_TEMPLATE.find((a) => a.code === "2000")!;
  const payroll = RESTAURANT_COA_TEMPLATE.find((a) => a.code === "2100")!;

  for (const line of lines) {
    if (line.isSubtotal || line.actual === 0) continue;
    const coa = RESTAURANT_COA_TEMPLATE.find((a) => a.pnlLineKey === line.key);
    if (!coa) continue;

    const amount = roundMoney(Math.abs(line.actual));
    const memo = `OS Kitchen ${opts.periodLabel} — ${line.label}`;

    if (line.key === "revenue") {
      entries.push({
        id: `je-${line.key}`,
        date: opts.txnDate,
        memo,
        pnlLineKey: line.key,
        lines: [
          {
            accountCode: undeposited.code,
            accountName: undeposited.name,
            debit: amount,
            credit: 0,
            pnlLineKey: line.key,
          },
          {
            accountCode: coa.code,
            accountName: coa.name,
            debit: 0,
            credit: amount,
            pnlLineKey: line.key,
          },
        ],
      });
      continue;
    }

    const creditAccount =
      line.key === "food_cost" ? ap : line.key === "labor" ? payroll : retained;

    entries.push({
      id: `je-${line.key}`,
      date: opts.txnDate,
      memo,
      pnlLineKey: line.key,
      lines: [
        {
          accountCode: coa.code,
          accountName: coa.name,
          debit: amount,
          credit: 0,
          pnlLineKey: line.key,
        },
        {
          accountCode: creditAccount.code,
          accountName: creditAccount.name,
          debit: 0,
          credit: amount,
          pnlLineKey: line.key,
        },
      ],
    });
  }

  return entries;
}

export function reconcilePnlWithJournal(
  lines: PnlLine[],
  entries: GlJournalEntry[],
): GlPnlReconciliationRow[] {
  const journalByKey = new Map<string, number>();

  for (const entry of entries) {
    const expenseDebit = entry.lines.find((l) => l.debit > 0 && l.pnlLineKey === entry.pnlLineKey);
    const revenueCredit = entry.lines.find((l) => l.credit > 0 && l.pnlLineKey === entry.pnlLineKey);
    const amount = expenseDebit?.debit ?? revenueCredit?.credit ?? 0;
    journalByKey.set(entry.pnlLineKey, roundMoney(amount));
  }

  return lines
    .filter((l) => !l.isSubtotal && l.actual !== 0)
    .map((line) => {
      const journalAmount = journalByKey.get(line.key) ?? 0;
      const statementAmount = roundMoney(Math.abs(line.actual));
      const variance = roundMoney(statementAmount - journalAmount);
      const withinTolerance = Math.abs(variance) <= GL_DEPTH_RECONCILIATION_TOLERANCE;

      return {
        pnlLineKey: line.key,
        label: line.label,
        statementAmount,
        journalAmount,
        variance,
        status: withinTolerance ? "synced" : "variance",
      };
    });
}

export function summarizeGlDepthAccounting(
  entries: GlJournalEntry[],
  reconciliation: GlPnlReconciliationRow[],
): GlDepthAccountingSummary {
  let totalDebits = 0;
  let totalCredits = 0;

  for (const entry of entries) {
    for (const line of entry.lines) {
      totalDebits += line.debit;
      totalCredits += line.credit;
    }
  }

  totalDebits = roundMoney(totalDebits);
  totalCredits = roundMoney(totalCredits);

  const syncedLineCount = reconciliation.filter((r) => r.status === "synced").length;
  const varianceLineCount = reconciliation.filter((r) => r.status === "variance").length;

  return {
    accountCount: RESTAURANT_COA_TEMPLATE.length,
    journalEntryCount: entries.length,
    syncedLineCount,
    varianceLineCount,
    totalDebits,
    totalCredits,
    balanced: Math.abs(totalDebits - totalCredits) <= GL_DEPTH_RECONCILIATION_TOLERANCE,
  };
}

export function journalEntriesToCsv(entries: GlJournalEntry[]): string {
  const header = "Date,Memo,Account Code,Account Name,Debit,Credit,P&L Line";
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
        ].join(","),
      );
    }
  }

  return rows.join("\n");
}
