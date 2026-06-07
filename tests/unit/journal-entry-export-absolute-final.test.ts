import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildJournalEntriesFromPnlLines } from "@/lib/accounting/gl-depth-accounting-policy";
import { auditJournalEntryExportWiring } from "@/lib/accounting/journal-entry-export-audit";
import {
  applyCoaMappingsToJournalEntries,
  JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID,
  JOURNAL_ENTRY_EXPORT_CI_SCRIPTS,
  JOURNAL_ENTRY_EXPORT_FORMATS,
  JOURNAL_ENTRY_EXPORT_JSON_ROUTE,
  JOURNAL_ENTRY_EXPORT_ROUTE,
  JOURNAL_ENTRY_EXPORT_UNIT_TEST,
  journalEntriesToExportCsv,
  journalEntriesToExportJson,
  journalEntriesToQuickBooksCsv,
  summarizeJournalEntryExport,
} from "@/lib/accounting/journal-entry-export-absolute-final-policy";
import type { CoaMappingRow } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import type { PnlLine } from "@/services/accounting/restaurant-pnl-service";

const ROOT = process.cwd();

const sampleLines: PnlLine[] = [
  { key: "revenue", label: "Food & beverage sales", actual: 5000, budget: 5000, variance: 0 },
  { key: "food_cost", label: "Food cost", actual: 1500, budget: 1500, variance: 0 },
];

describe("Journal entry export (Absolute Final Task 97)", () => {
  it("locks absolute final policy and /dashboard/accounting/journal-export route", () => {
    expect(JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "journal-entry-export-absolute-final-v1",
    );
    expect(JOURNAL_ENTRY_EXPORT_ROUTE).toBe("/dashboard/accounting/journal-export");
    expect(JOURNAL_ENTRY_EXPORT_JSON_ROUTE).toBe("/api/export/gl-journal/json");
    expect(JOURNAL_ENTRY_EXPORT_FORMATS).toHaveLength(3);
  });

  it("applies COA mappings and exports CSV/JSON/QuickBooks formats", () => {
    const entries = buildJournalEntriesFromPnlLines(sampleLines, {
      periodLabel: "Monthly",
      txnDate: "2026-06-01",
    });
    const mappings: CoaMappingRow[] = [
      {
        pnlLineKey: "revenue",
        pnlLineLabel: "Sales",
        glAccountCode: "4100",
        glAccountName: "Food & Beverage Sales",
        externalProvider: "quickbooks",
        externalAccountId: "qb-sales",
        externalAccountName: "Sales Income",
      },
      {
        pnlLineKey: "food_cost",
        pnlLineLabel: "Food cost",
        glAccountCode: "5100",
        glAccountName: "Food Cost",
        externalProvider: null,
        externalAccountId: null,
        externalAccountName: null,
      },
      {
        pnlLineKey: "labor",
        pnlLineLabel: "Labor",
        glAccountCode: "5200",
        glAccountName: "Labor Cost",
        externalProvider: null,
        externalAccountId: null,
        externalAccountName: null,
      },
      {
        pnlLineKey: "occupancy",
        pnlLineLabel: "Occupancy",
        glAccountCode: "5300",
        glAccountName: "Occupancy",
        externalProvider: null,
        externalAccountId: null,
        externalAccountName: null,
      },
      {
        pnlLineKey: "supplies",
        pnlLineLabel: "Supplies",
        glAccountCode: "5400",
        glAccountName: "Operating Supplies",
        externalProvider: null,
        externalAccountId: null,
        externalAccountName: null,
      },
      {
        pnlLineKey: "repairs",
        pnlLineLabel: "Repairs",
        glAccountCode: "5500",
        glAccountName: "Repairs & Maintenance",
        externalProvider: null,
        externalAccountId: null,
        externalAccountName: null,
      },
      {
        pnlLineKey: "marketing",
        pnlLineLabel: "Marketing",
        glAccountCode: "5600",
        glAccountName: "Marketing",
        externalProvider: null,
        externalAccountId: null,
        externalAccountName: null,
      },
      {
        pnlLineKey: "admin",
        pnlLineLabel: "Admin",
        glAccountCode: "5700",
        glAccountName: "Admin & G&A",
        externalProvider: null,
        externalAccountId: null,
        externalAccountName: null,
      },
    ];

    const exported = applyCoaMappingsToJournalEntries(entries, mappings);
    const summary = summarizeJournalEntryExport(exported);
    expect(summary.balanced).toBe(true);
    expect(summary.mappedLineCount).toBeGreaterThan(0);

    const csv = journalEntriesToExportCsv(exported);
    expect(csv).toContain("QuickBooks Account ID");
    expect(csv).toContain("qb-sales");

    const qbCsv = journalEntriesToQuickBooksCsv(exported);
    expect(qbCsv).toContain("Sales Income");

    const json = journalEntriesToExportJson(exported, {
      period: "month",
      periodLabel: "Monthly",
      exportedAt: "2026-06-06T12:00:00.000Z",
    });
    const parsed = JSON.parse(json) as { entries: unknown[]; disclaimer: string };
    expect(parsed.entries.length).toBeGreaterThan(0);
    expect(parsed.disclaimer).toContain("BETA");
  });

  it("passes wiring audit", () => {
    const audit = auditJournalEntryExportWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of JOURNAL_ENTRY_EXPORT_CI_SCRIPTS) {
      expect(pkg.scripts?.[script], `missing script ${script}`).toBeTruthy();
    }
    expect(JOURNAL_ENTRY_EXPORT_UNIT_TEST).toContain(
      "journal-entry-export-absolute-final.test.ts",
    );
  });
});
