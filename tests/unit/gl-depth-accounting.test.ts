import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildJournalEntriesFromPnlLines,
  GL_DEPTH_ACCOUNTING_EXPORT_ROUTE,
  GL_DEPTH_ACCOUNTING_PANEL_PATH,
  GL_DEPTH_ACCOUNTING_POLICY_ID,
  GL_DEPTH_ACCOUNTING_ROUTE,
  GL_DEPTH_ACCOUNTING_SERVICE_PATH,
  journalEntriesToCsv,
  reconcilePnlWithJournal,
  summarizeGlDepthAccounting,
} from "@/lib/accounting/gl-depth-accounting-policy";
import { RESTAURANT_COA_TEMPLATE } from "@/lib/accounting/restaurant-coa-template";
import type { PnlLine } from "@/services/accounting/restaurant-pnl-service";

const ROOT = process.cwd();

const sampleLines: PnlLine[] = [
  { key: "revenue", label: "Food & beverage sales", actual: 10000, budget: 10000, variance: 0 },
  { key: "food_cost", label: "Food cost", actual: 3000, budget: 3000, variance: 0 },
  { key: "labor", label: "Labor cost", actual: 2800, budget: 3000, variance: -200 },
];

describe("GL-depth accounting sync (Absolute Final Task 41)", () => {
  it("locks policy id, route, and COA template depth", () => {
    expect(GL_DEPTH_ACCOUNTING_POLICY_ID).toBe("gl-depth-accounting-absolute-final-v1");
    expect(GL_DEPTH_ACCOUNTING_ROUTE).toBe("/dashboard/accounting/gl-sync");
    expect(GL_DEPTH_ACCOUNTING_EXPORT_ROUTE).toBe("/api/export/gl-journal");
    expect(RESTAURANT_COA_TEMPLATE.length).toBeGreaterThanOrEqual(10);
    expect(RESTAURANT_COA_TEMPLATE.some((a) => a.pnlLineKey === "revenue")).toBe(true);
    expect(RESTAURANT_COA_TEMPLATE.some((a) => a.pnlLineKey === "food_cost")).toBe(true);
  });

  it("builds balanced journal entries from P&L lines", () => {
    const entries = buildJournalEntriesFromPnlLines(sampleLines, {
      periodLabel: "Monthly",
      txnDate: "2026-06-01",
    });
    expect(entries).toHaveLength(3);
    const summary = summarizeGlDepthAccounting(entries, reconcilePnlWithJournal(sampleLines, entries));
    expect(summary.balanced).toBe(true);
    expect(summary.totalDebits).toBe(summary.totalCredits);
  });

  it("reconciles P&L statement amounts with journal totals", () => {
    const entries = buildJournalEntriesFromPnlLines(sampleLines, {
      periodLabel: "Monthly",
      txnDate: "2026-06-01",
    });
    const reconciliation = reconcilePnlWithJournal(sampleLines, entries);
    expect(reconciliation.every((r) => r.status === "synced")).toBe(true);
    expect(reconciliation.find((r) => r.pnlLineKey === "revenue")?.journalAmount).toBe(10000);
  });

  it("exports journal entries as CSV with account codes", () => {
    const entries = buildJournalEntriesFromPnlLines(sampleLines, {
      periodLabel: "Monthly",
      txnDate: "2026-06-01",
    });
    const csv = journalEntriesToCsv(entries);
    expect(csv).toContain("Account Code");
    expect(csv).toContain("4100");
    expect(csv).toContain("5100");
  });

  it("wires GL sync panel into accounting gl-sync page", () => {
    const pageSource = readFileSync(join(ROOT, "app/dashboard/accounting/gl-sync/page.tsx"), "utf8");
    expect(pageSource).toContain("GlDepthSyncPanel");
    expect(pageSource).toContain("loadGlDepthAccountingModel");
  });

  it("loads operational P&L in gl-depth accounting service", () => {
    const serviceSource = readFileSync(join(ROOT, GL_DEPTH_ACCOUNTING_SERVICE_PATH), "utf8");
    expect(serviceSource).toContain("getRestaurantPnLStatement");
    expect(serviceSource).toContain("buildJournalEntriesFromPnlLines");
    expect(serviceSource).toContain("GL_DEPTH_ACCOUNTING_POLICY_ID");
  });

  it("renders chart of accounts, journal, and reconciliation sections", () => {
    const panelSource = readFileSync(join(ROOT, GL_DEPTH_ACCOUNTING_PANEL_PATH), "utf8");
    expect(panelSource).toContain('data-testid="gl-depth-sync-panel"');
    expect(panelSource).toContain("Chart of accounts");
    expect(panelSource).toContain("Journal entries");
    expect(panelSource).toContain("P&L reconciliation");
  });
});
