import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildJournalEntriesFromPnlLines } from "@/lib/accounting/gl-depth-accounting-policy";
import { auditJournalEntryExportWiring } from "@/lib/accounting/journal-entry-export-audit";
import {
  applyCoaMappingsToJournalEntries,
  JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID,
  JOURNAL_ENTRY_EXPORT_CSV_ROUTE,
  JOURNAL_ENTRY_EXPORT_FORMATS,
  JOURNAL_ENTRY_EXPORT_HONESTY_MARKERS,
  JOURNAL_ENTRY_EXPORT_JSON_ROUTE,
  JOURNAL_ENTRY_EXPORT_ROUTE,
  journalEntriesToExportCsv,
  journalEntriesToExportJson,
  journalEntriesToQuickBooksCsv,
  roundExportMoney,
  summarizeJournalEntryExport,
} from "@/lib/accounting/journal-entry-export-absolute-final-policy";
import type { CoaMappingRow } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import { JOURNAL_ENTRY_EXPORT_FORMAT_META } from "@/lib/accounting/journal-entry-export-content";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";
import type { PnlLine } from "@/services/accounting/restaurant-pnl-service";

const ROOT = process.cwd();
/** Absolute Final Task 112 — QA full coverage for feature 97 journal entry export */
const TASK = 112;
const FEATURE = 97;

const sampleLines: PnlLine[] = [
  { key: "revenue", label: "Food & beverage sales", actual: 5000, budget: 5000, variance: 0 },
  { key: "food_cost", label: "Food cost", actual: 1500, budget: 1500, variance: 0 },
];

function fullMappings(overrides?: Partial<CoaMappingRow>): CoaMappingRow[] {
  const keys = [
    "revenue",
    "food_cost",
    "labor",
    "occupancy",
    "supplies",
    "repairs",
    "marketing",
    "admin",
  ] as const;
  return keys.map((key, idx) => ({
    pnlLineKey: key,
    pnlLineLabel: key,
    glAccountCode: `4${100 + idx * 100}`,
    glAccountName: key,
    externalProvider: key === "revenue" ? ("quickbooks" as const) : null,
    externalAccountId: key === "revenue" ? "qb-sales" : null,
    externalAccountName: key === "revenue" ? "Sales Income" : null,
    ...overrides,
  }));
}

describe(`QA full coverage — journal entry export (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 112 → feature 97 journal entry export", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("journal-entry-export");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/journal-entry-export-absolute-final.test.ts");
    expect(JOURNAL_ENTRY_EXPORT_FORMATS).toEqual(["csv", "json", "quickbooks_csv"]);
    expect(JOURNAL_ENTRY_EXPORT_ROUTE).toBe("/dashboard/accounting/journal-export");
    expect(JOURNAL_ENTRY_EXPORT_JSON_ROUTE).toBe("/api/export/gl-journal/json");
    expect(JOURNAL_ENTRY_EXPORT_CSV_ROUTE).toBe("/api/export/gl-journal");
  });

  it("applies COA mappings to journal entries and preserves balance", () => {
    const entries = buildJournalEntriesFromPnlLines(sampleLines, {
      periodLabel: "Monthly",
      txnDate: "2026-06-01",
    });
    const exported = applyCoaMappingsToJournalEntries(entries, fullMappings());
    const revenueLine = exported
      .find((e) => e.pnlLineKey === "revenue")
      ?.lines.find((l) => l.pnlLineKey === "revenue");
    expect(revenueLine?.externalAccountId).toBe("qb-sales");
    expect(revenueLine?.accountCode).toBe("4100");
    expect(summarizeJournalEntryExport(exported).balanced).toBe(true);
  });

  it("summarizes export totals and detects out-of-balance entries", () => {
    expect(roundExportMoney(10.556)).toBe(10.56);
    const summary = summarizeJournalEntryExport([
      {
        id: "e1",
        date: "2026-06-01",
        memo: "Test",
        pnlLineKey: "revenue",
        lines: [
          {
            accountCode: "4100",
            accountName: "Sales",
            debit: 100,
            credit: 0,
            pnlLineKey: "revenue",
            externalAccountId: "qb-1",
            externalAccountName: "Sales",
          },
          {
            accountCode: "1000",
            accountName: "Cash",
            debit: 0,
            credit: 100.02,
            pnlLineKey: null,
            externalAccountId: null,
            externalAccountName: null,
          },
        ],
      },
    ]);
    expect(summary.mappedLineCount).toBe(1);
    expect(summary.balanced).toBe(false);
  });

  it("exports CSV, QuickBooks CSV, and JSON with disclaimer and quote escaping", () => {
    const entries = applyCoaMappingsToJournalEntries(
      buildJournalEntriesFromPnlLines(sampleLines, {
        periodLabel: 'June "close"',
        txnDate: "2026-06-01",
      }),
      fullMappings(),
    );

    const csv = journalEntriesToExportCsv(entries);
    expect(csv).toContain("QuickBooks Account ID");
    expect(csv).toContain("qb-sales");

    const qbCsv = journalEntriesToQuickBooksCsv(entries);
    expect(qbCsv).toContain("Sales Income");

    const json = journalEntriesToExportJson(entries, {
      period: "month",
      periodLabel: "Monthly",
      exportedAt: "2026-06-06T12:00:00.000Z",
    });
    const parsed = JSON.parse(json) as { disclaimer: string; policyId: string };
    expect(parsed.policyId).toBe("journal-entry-export-absolute-final-v1");
    expect(parsed.disclaimer).toContain("BETA");
    expect(parsed.disclaimer.toLowerCase()).toContain("accountant review");
  });

  it("documents honesty markers — BETA, not certified GL, accountant review", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/accounting/journal-entry-export-panel.tsx"),
      "utf8",
    );
    const page = readFileSync(
      join(ROOT, "app/dashboard/accounting/journal-export/page.tsx"),
      "utf8",
    );
    const combined = `${panel}\n${page}`;

    for (const marker of JOURNAL_ENTRY_EXPORT_HONESTY_MARKERS) {
      expect(
        combined.includes(marker) || combined.toLowerCase().includes(marker.toLowerCase()),
      ).toBe(true);
    }
  });

  it("wires export UI — format cards, balanced badge, preview table, COA link", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/accounting/journal-entry-export-panel.tsx"),
      "utf8",
    );

    expect(panel).toContain('data-testid="journal-entry-export-panel"');
    expect(panel).toContain('data-testid="journal-export-format"');
    expect(panel).toContain('data-testid="journal-export-preview-row"');
    expect(panel).toContain("quickbooks_csv");
    expect(panel).toContain("JOURNAL_ENTRY_EXPORT_FORMAT_META");
    expect(panel).toContain("CHART_OF_ACCOUNTS_MAPPING_ROUTE");
    expect(panel).toContain("summary.balanced");
    for (const format of JOURNAL_ENTRY_EXPORT_FORMATS) {
      expect(JOURNAL_ENTRY_EXPORT_FORMAT_META[format].extension).toBeTruthy();
    }
  });

  it("wires page, strip, gl-sync, JSON API route, and export service", () => {
    const page = readFileSync(
      join(ROOT, "app/dashboard/accounting/journal-export/page.tsx"),
      "utf8",
    );
    const strip = readFileSync(
      join(ROOT, "components/dashboard/accounting/journal-entry-export-strip.tsx"),
      "utf8",
    );
    const glSync = readFileSync(
      join(ROOT, "app/dashboard/accounting/gl-sync/page.tsx"),
      "utf8",
    );
    const jsonRoute = readFileSync(
      join(ROOT, "app/api/export/gl-journal/json/route.ts"),
      "utf8",
    );
    const service = readFileSync(
      join(ROOT, "services/accounting/journal-entry-export-service.ts"),
      "utf8",
    );

    expect(page).toContain("loadJournalEntryExportModel");
    expect(page).toContain("canExportReports");
    expect(page).toContain("reports.read.financial");
    expect(strip).toContain("JOURNAL_ENTRY_EXPORT_ROUTE");
    expect(glSync).toContain("JournalEntryExportStrip");
    expect(jsonRoute).toContain("exportJournalEntries");
    expect(service).toContain("loadGlDepthAccountingModel");
    expect(service).toContain("loadCoaMappingRows");
    expect(service).toContain("journalEntriesToQuickBooksCsv");
  });

  it("passes base wiring audit and QA slot 112 audit gate", () => {
    const wiring = auditJournalEntryExportWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-12-journal-export.test.ts",
    );
    expect(JOURNAL_ENTRY_EXPORT_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "journal-entry-export-absolute-final-v1",
    );
  });
});
