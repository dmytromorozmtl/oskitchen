import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import type { GlPnlReconciliationRow } from "@/lib/accounting/gl-depth-accounting-policy";
import { auditPnlReconciliationViewWiring } from "@/lib/accounting/pnl-reconciliation-view-audit";
import {
  classifyReconciliationSeverity,
  computeVariancePercent,
  enrichPnlReconciliationRows,
  PNL_RECONCILIATION_MATERIAL_VARIANCE_PCT,
  PNL_RECONCILIATION_VIEW_ABSOLUTE_FINAL_POLICY_ID,
  PNL_RECONCILIATION_VIEW_EXPORT_ROUTE,
  PNL_RECONCILIATION_VIEW_HONESTY_MARKERS,
  PNL_RECONCILIATION_VIEW_ROUTE,
  pnlReconciliationViewToCsv,
  roundReconciliationMoney,
  summarizePnlReconciliationView,
} from "@/lib/accounting/pnl-reconciliation-view-absolute-final-policy";
import { PNL_RECONCILIATION_SEVERITY_META } from "@/lib/accounting/pnl-reconciliation-view-content";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";

const ROOT = process.cwd();
/** Absolute Final Task 113 — QA full coverage for feature 98 P&L reconciliation view */
const TASK = 113;
const FEATURE = 98;

const sampleRows: GlPnlReconciliationRow[] = [
  {
    pnlLineKey: "revenue",
    label: "Food & beverage sales",
    statementAmount: 10000,
    journalAmount: 10000,
    variance: 0,
    status: "synced",
  },
  {
    pnlLineKey: "food_cost",
    label: "Food cost",
    statementAmount: 3000,
    journalAmount: 2900,
    variance: 100,
    status: "variance",
  },
  {
    pnlLineKey: "labor",
    label: "Labor cost",
    statementAmount: 2000,
    journalAmount: 1500,
    variance: 500,
    status: "variance",
  },
];

describe(`QA full coverage — P&L reconciliation view (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 113 → feature 98 P&L reconciliation view", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("pnl-reconciliation-view");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/pnl-reconciliation-view-absolute-final.test.ts");
    expect(PNL_RECONCILIATION_MATERIAL_VARIANCE_PCT).toBe(5);
    expect(PNL_RECONCILIATION_VIEW_ROUTE).toBe("/dashboard/accounting/pnl-reconciliation");
    expect(PNL_RECONCILIATION_VIEW_EXPORT_ROUTE).toBe("/api/export/pnl-reconciliation");
  });

  it("classifies severity bands and computes variance percent edge cases", () => {
    expect(computeVariancePercent(10000, 0)).toBe(0);
    expect(computeVariancePercent(0, 50)).toBe(100);
    expect(computeVariancePercent(3000, 100)).toBeCloseTo(3.33, 1);
    expect(classifyReconciliationSeverity(0, 10000)).toBe("synced");
    expect(classifyReconciliationSeverity(100, 3000)).toBe("minor");
    expect(classifyReconciliationSeverity(500, 2000)).toBe("material");
    expect(roundReconciliationMoney(10.556)).toBe(10.56);
  });

  it("enriches rows with GL codes and summarizes reconciliation totals", () => {
    const enriched = enrichPnlReconciliationRows(sampleRows);
    expect(enriched[0]?.glAccountCode).toBe("4100");
    expect(enriched[0]?.severity).toBe("synced");
    expect(enriched[2]?.severity).toBe("material");

    const summary = summarizePnlReconciliationView(enriched);
    expect(summary.syncedCount).toBe(1);
    expect(summary.minorVarianceCount).toBe(1);
    expect(summary.materialVarianceCount).toBe(1);
    expect(summary.reconciliationPercent).toBe(33);
    expect(summary.totalLines).toBe(3);
  });

  it("exports reconciliation CSV with severity and GL code columns", () => {
    const enriched = enrichPnlReconciliationRows(sampleRows);
    const csv = pnlReconciliationViewToCsv(enriched);
    expect(csv).toContain("Severity");
    expect(csv).toContain("4100");
    expect(csv).toContain("material");
    expect(csv).toContain("Food & beverage sales");
    expect(enriched.every((row) => PNL_RECONCILIATION_SEVERITY_META[row.severity])).toBe(true);
  });

  it("documents honesty markers — BETA, operational P&L, not certified GL", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/accounting/pnl-reconciliation-view-panel.tsx"),
      "utf8",
    );
    const page = readFileSync(
      join(ROOT, "app/dashboard/accounting/pnl-reconciliation/page.tsx"),
      "utf8",
    );
    const combined = `${panel}\n${page}`;

    for (const marker of PNL_RECONCILIATION_VIEW_HONESTY_MARKERS) {
      expect(
        combined.includes(marker) || combined.toLowerCase().includes(marker.toLowerCase()),
      ).toBe(true);
    }
  });

  it("wires reconciliation UI — summary cards, severity badges, line table, export", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/accounting/pnl-reconciliation-view-panel.tsx"),
      "utf8",
    );

    expect(panel).toContain('data-testid="pnl-reconciliation-view-panel"');
    expect(panel).toContain('data-testid="pnl-reconciliation-view-row"');
    expect(panel).toContain("reconciliationPercent");
    expect(panel).toContain("materialVarianceCount");
    expect(panel).toContain("PNL_RECONCILIATION_SEVERITY_META");
    expect(panel).toContain("PNL_RECONCILIATION_VIEW_EXPORT_ROUTE");
    expect(panel).toContain("dark:text-emerald-400");
    expect(panel).toContain("GL_DEPTH_ACCOUNTING_ROUTE");
    expect(panel).toContain("JOURNAL_ENTRY_EXPORT_ROUTE");
  });

  it("wires page, strip, gl-sync, export API route, and service", () => {
    const page = readFileSync(
      join(ROOT, "app/dashboard/accounting/pnl-reconciliation/page.tsx"),
      "utf8",
    );
    const strip = readFileSync(
      join(ROOT, "components/dashboard/accounting/pnl-reconciliation-view-strip.tsx"),
      "utf8",
    );
    const glSync = readFileSync(
      join(ROOT, "app/dashboard/accounting/gl-sync/page.tsx"),
      "utf8",
    );
    const exportRoute = readFileSync(
      join(ROOT, "app/api/export/pnl-reconciliation/route.ts"),
      "utf8",
    );
    const service = readFileSync(
      join(ROOT, "services/accounting/pnl-reconciliation-view-service.ts"),
      "utf8",
    );

    expect(page).toContain("loadPnlReconciliationViewModel");
    expect(page).toContain("canExportReports");
    expect(page).toContain("reports.read.financial");
    expect(strip).toContain("PNL_RECONCILIATION_VIEW_ROUTE");
    expect(glSync).toContain("PnlReconciliationViewStrip");
    expect(exportRoute).toContain("exportPnlReconciliationCsv");
    expect(service).toContain("loadGlDepthAccountingModel");
    expect(service).toContain("enrichPnlReconciliationRows");
  });

  it("passes base wiring audit and QA slot 113 audit gate", () => {
    const wiring = auditPnlReconciliationViewWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-13-pnl-reconciliation.test.ts",
    );
    expect(PNL_RECONCILIATION_VIEW_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "pnl-reconciliation-view-absolute-final-v1",
    );
  });
});
