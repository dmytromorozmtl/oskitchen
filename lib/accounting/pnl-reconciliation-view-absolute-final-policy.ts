/**
 * Absolute Final Task 98 — P&L reconciliation view.
 *
 * @see app/dashboard/accounting/pnl-reconciliation/page.tsx
 * @see components/dashboard/accounting/pnl-reconciliation-view-panel.tsx
 */

import type { GlPnlReconciliationRow } from "@/lib/accounting/gl-depth-accounting-policy";
import { GL_DEPTH_RECONCILIATION_TOLERANCE } from "@/lib/accounting/gl-depth-accounting-policy";
import { coaAccountByPnlLineKey } from "@/lib/accounting/restaurant-coa-template";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

export const PNL_RECONCILIATION_VIEW_ABSOLUTE_FINAL_POLICY_ID =
  "pnl-reconciliation-view-absolute-final-v1" as const;

export const PNL_RECONCILIATION_VIEW_ROUTE =
  "/dashboard/accounting/pnl-reconciliation" as const;

export const PNL_RECONCILIATION_VIEW_PAGE_PATH =
  "app/dashboard/accounting/pnl-reconciliation/page.tsx" as const;

export const PNL_RECONCILIATION_VIEW_COMPONENT_PATH =
  "components/dashboard/accounting/pnl-reconciliation-view-panel.tsx" as const;

export const PNL_RECONCILIATION_VIEW_SERVICE_PATH =
  "services/accounting/pnl-reconciliation-view-service.ts" as const;

export const PNL_RECONCILIATION_VIEW_CONTENT_PATH =
  "lib/accounting/pnl-reconciliation-view-content.ts" as const;

export const PNL_RECONCILIATION_VIEW_STRIP_PATH =
  "components/dashboard/accounting/pnl-reconciliation-view-strip.tsx" as const;

export const PNL_RECONCILIATION_VIEW_GL_SYNC_PAGE =
  "app/dashboard/accounting/gl-sync/page.tsx" as const;

export const PNL_RECONCILIATION_VIEW_EXPORT_ROUTE =
  "/api/export/pnl-reconciliation" as const;

export const PNL_RECONCILIATION_MATERIAL_VARIANCE_PCT = 5 as const;

export type PnlReconciliationSeverity = "synced" | "minor" | "material";

export type PnlReconciliationViewRow = GlPnlReconciliationRow & {
  glAccountCode: string | null;
  glAccountName: string | null;
  variancePercent: number;
  severity: PnlReconciliationSeverity;
};

export type PnlReconciliationViewSummary = {
  totalLines: number;
  syncedCount: number;
  minorVarianceCount: number;
  materialVarianceCount: number;
  totalStatementAmount: number;
  totalJournalAmount: number;
  netVariance: number;
  reconciliationPercent: number;
  balanced: boolean;
};

export type PnlReconciliationViewModel = {
  policyId: typeof PNL_RECONCILIATION_VIEW_ABSOLUTE_FINAL_POLICY_ID;
  period: PnlPeriod;
  periodLabel: string;
  rows: PnlReconciliationViewRow[];
  summary: PnlReconciliationViewSummary;
  canExport: boolean;
  refreshedAt: string;
};

export const PNL_RECONCILIATION_VIEW_REQUIRED_MARKERS = [
  'data-testid="pnl-reconciliation-view-panel"',
  "PnlReconciliationViewPanel",
] as const;

export const PNL_RECONCILIATION_VIEW_HONESTY_MARKERS = [
  "BETA",
  "operational P&L",
  "not a certified GL",
  "accountant review",
  "Do not claim",
] as const;

export const PNL_RECONCILIATION_VIEW_WIRING_PATHS = [
  PNL_RECONCILIATION_VIEW_PAGE_PATH,
  PNL_RECONCILIATION_VIEW_COMPONENT_PATH,
  PNL_RECONCILIATION_VIEW_SERVICE_PATH,
  PNL_RECONCILIATION_VIEW_CONTENT_PATH,
  PNL_RECONCILIATION_VIEW_STRIP_PATH,
  PNL_RECONCILIATION_VIEW_GL_SYNC_PAGE,
  "app/api/export/pnl-reconciliation/route.ts",
  "lib/accounting/pnl-reconciliation-view-absolute-final-policy.ts",
  "lib/accounting/pnl-reconciliation-view-audit.ts",
  "tests/unit/pnl-reconciliation-view-absolute-final.test.ts",
] as const;

export const PNL_RECONCILIATION_VIEW_UNIT_TEST =
  "tests/unit/pnl-reconciliation-view-absolute-final.test.ts" as const;

export const PNL_RECONCILIATION_VIEW_CI_SCRIPTS = [
  "test:ci:pnl-reconciliation-view",
  "test:ci:pnl-reconciliation-view:cert",
] as const;

export function roundReconciliationMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeVariancePercent(statementAmount: number, variance: number): number {
  if (statementAmount === 0) return variance === 0 ? 0 : 100;
  return roundReconciliationMoney((Math.abs(variance) / Math.abs(statementAmount)) * 100);
}

export function classifyReconciliationSeverity(
  variance: number,
  statementAmount: number,
): PnlReconciliationSeverity {
  if (Math.abs(variance) <= GL_DEPTH_RECONCILIATION_TOLERANCE) return "synced";
  const pct = computeVariancePercent(statementAmount, variance);
  if (pct >= PNL_RECONCILIATION_MATERIAL_VARIANCE_PCT) return "material";
  return "minor";
}

export function enrichPnlReconciliationRows(
  rows: readonly GlPnlReconciliationRow[],
): PnlReconciliationViewRow[] {
  return rows.map((row) => {
    const coa = coaAccountByPnlLineKey(row.pnlLineKey);
    const severity = classifyReconciliationSeverity(row.variance, row.statementAmount);
    return {
      ...row,
      glAccountCode: coa?.code ?? null,
      glAccountName: coa?.name ?? null,
      variancePercent: computeVariancePercent(row.statementAmount, row.variance),
      severity,
      status: severity === "synced" ? "synced" : "variance",
    };
  });
}

export function summarizePnlReconciliationView(
  rows: readonly PnlReconciliationViewRow[],
): PnlReconciliationViewSummary {
  const syncedCount = rows.filter((r) => r.severity === "synced").length;
  const minorVarianceCount = rows.filter((r) => r.severity === "minor").length;
  const materialVarianceCount = rows.filter((r) => r.severity === "material").length;

  const totalStatementAmount = roundReconciliationMoney(
    rows.reduce((sum, r) => sum + r.statementAmount, 0),
  );
  const totalJournalAmount = roundReconciliationMoney(
    rows.reduce((sum, r) => sum + r.journalAmount, 0),
  );
  const netVariance = roundReconciliationMoney(totalStatementAmount - totalJournalAmount);

  return {
    totalLines: rows.length,
    syncedCount,
    minorVarianceCount,
    materialVarianceCount,
    totalStatementAmount,
    totalJournalAmount,
    netVariance,
    reconciliationPercent:
      rows.length === 0 ? 0 : Math.round((syncedCount / rows.length) * 100),
    balanced: Math.abs(netVariance) <= GL_DEPTH_RECONCILIATION_TOLERANCE,
  };
}

export function pnlReconciliationViewToCsv(rows: readonly PnlReconciliationViewRow[]): string {
  const header =
    "P&L Line,GL Code,Statement Amount,Journal Amount,Variance,Variance %,Severity,Status";
  const lines = rows.map((row) =>
    [
      `"${row.label.replace(/"/g, '""')}"`,
      row.glAccountCode ?? "",
      row.statementAmount.toFixed(2),
      row.journalAmount.toFixed(2),
      row.variance.toFixed(2),
      row.variancePercent.toFixed(1),
      row.severity,
      row.status,
    ].join(","),
  );
  return [header, ...lines].join("\n");
}
