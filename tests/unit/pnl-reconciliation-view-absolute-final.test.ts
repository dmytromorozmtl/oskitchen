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
  PNL_RECONCILIATION_VIEW_CI_SCRIPTS,
  PNL_RECONCILIATION_VIEW_ROUTE,
  PNL_RECONCILIATION_VIEW_UNIT_TEST,
  pnlReconciliationViewToCsv,
  summarizePnlReconciliationView,
} from "@/lib/accounting/pnl-reconciliation-view-absolute-final-policy";

const ROOT = process.cwd();

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

describe("P&L reconciliation view (Absolute Final Task 98)", () => {
  it("locks absolute final policy and /dashboard/accounting/pnl-reconciliation route", () => {
    expect(PNL_RECONCILIATION_VIEW_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "pnl-reconciliation-view-absolute-final-v1",
    );
    expect(PNL_RECONCILIATION_VIEW_ROUTE).toBe("/dashboard/accounting/pnl-reconciliation");
    expect(PNL_RECONCILIATION_MATERIAL_VARIANCE_PCT).toBe(5);
  });

  it("classifies severity and computes variance percent", () => {
    expect(computeVariancePercent(10000, 0)).toBe(0);
    expect(computeVariancePercent(3000, 100)).toBeCloseTo(3.33, 1);
    expect(classifyReconciliationSeverity(0, 10000)).toBe("synced");
    expect(classifyReconciliationSeverity(100, 3000)).toBe("minor");
    expect(classifyReconciliationSeverity(500, 2000)).toBe("material");
  });

  it("enriches rows with GL codes and summarizes reconciliation", () => {
    const enriched = enrichPnlReconciliationRows(sampleRows);
    expect(enriched[0]?.glAccountCode).toBe("4100");
    expect(enriched[0]?.severity).toBe("synced");
    expect(enriched[2]?.severity).toBe("material");

    const summary = summarizePnlReconciliationView(enriched);
    expect(summary.syncedCount).toBe(1);
    expect(summary.materialVarianceCount).toBe(1);
    expect(summary.reconciliationPercent).toBe(33);
  });

  it("exports reconciliation CSV with severity column", () => {
    const enriched = enrichPnlReconciliationRows(sampleRows);
    const csv = pnlReconciliationViewToCsv(enriched);
    expect(csv).toContain("Severity");
    expect(csv).toContain("4100");
    expect(csv).toContain("material");
  });

  it("passes wiring audit", () => {
    const audit = auditPnlReconciliationViewWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of PNL_RECONCILIATION_VIEW_CI_SCRIPTS) {
      expect(pkg.scripts?.[script], `missing script ${script}`).toBeTruthy();
    }
    expect(PNL_RECONCILIATION_VIEW_UNIT_TEST).toContain(
      "pnl-reconciliation-view-absolute-final.test.ts",
    );
  });
});
