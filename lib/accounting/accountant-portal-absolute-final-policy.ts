/**
 * Absolute Final Task 99 — accountant portal.
 *
 * @see app/dashboard/accounting/accountant-portal/page.tsx
 * @see components/dashboard/accounting/accountant-portal-panel.tsx
 */

import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

export const ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID =
  "accountant-portal-absolute-final-v1" as const;

export const ACCOUNTANT_PORTAL_ROUTE = "/dashboard/accounting/accountant-portal" as const;

export const ACCOUNTANT_PORTAL_PAGE_PATH =
  "app/dashboard/accounting/accountant-portal/page.tsx" as const;

export const ACCOUNTANT_PORTAL_COMPONENT_PATH =
  "components/dashboard/accounting/accountant-portal-panel.tsx" as const;

export const ACCOUNTANT_PORTAL_SERVICE_PATH =
  "services/accounting/accountant-portal-service.ts" as const;

export const ACCOUNTANT_PORTAL_CONTENT_PATH =
  "lib/accounting/accountant-portal-content.ts" as const;

export const ACCOUNTANT_PORTAL_STRIP_PATH =
  "components/dashboard/accounting/accountant-portal-strip.tsx" as const;

export const ACCOUNTANT_PORTAL_GL_SYNC_PAGE =
  "app/dashboard/accounting/gl-sync/page.tsx" as const;

export const ACCOUNTANT_PORTAL_PILLARS = [
  "export_package_hub",
  "coa_and_journal_readiness",
  "reconciliation_status",
  "quickbooks_handoff",
  "read_only_accountant_posture",
] as const;

export type AccountantPortalMaturity = "LIVE" | "BETA" | "SKIPPED";

export type AccountantPortalDeliverable = {
  id: string;
  pillar: (typeof ACCOUNTANT_PORTAL_PILLARS)[number];
  label: string;
  description: string;
  route: string;
  exportRoute: string | null;
  maturity: AccountantPortalMaturity;
  statusLabel: string;
};

export type AccountantPortalSummary = {
  deliverableCount: number;
  liveCount: number;
  betaCount: number;
  coaCoveragePercent: number;
  reconciliationPercent: number;
  materialVarianceCount: number;
  journalEntryCount: number;
  quickBooksConnected: boolean;
  canExport: boolean;
  periodCloseReady: boolean;
};

export type AccountantPortalModel = {
  policyId: typeof ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID;
  period: PnlPeriod;
  periodLabel: string;
  deliverables: AccountantPortalDeliverable[];
  summary: AccountantPortalSummary;
  refreshedAt: string;
};

export const ACCOUNTANT_PORTAL_REQUIRED_MARKERS = [
  'data-testid="accountant-portal-panel"',
  "AccountantPortalPanel",
] as const;

export const ACCOUNTANT_PORTAL_HONESTY_MARKERS = [
  "BETA",
  "read-only",
  "not a certified GL",
  "accountant review",
  "Do not claim",
] as const;

export const ACCOUNTANT_PORTAL_WIRING_PATHS = [
  ACCOUNTANT_PORTAL_PAGE_PATH,
  ACCOUNTANT_PORTAL_COMPONENT_PATH,
  ACCOUNTANT_PORTAL_SERVICE_PATH,
  ACCOUNTANT_PORTAL_CONTENT_PATH,
  ACCOUNTANT_PORTAL_STRIP_PATH,
  ACCOUNTANT_PORTAL_GL_SYNC_PAGE,
  "lib/accounting/accountant-portal-absolute-final-policy.ts",
  "lib/accounting/accountant-portal-audit.ts",
  "tests/unit/accountant-portal-absolute-final.test.ts",
] as const;

export const ACCOUNTANT_PORTAL_UNIT_TEST =
  "tests/unit/accountant-portal-absolute-final.test.ts" as const;

export const ACCOUNTANT_PORTAL_CI_SCRIPTS = [
  "test:ci:accountant-portal",
  "test:ci:accountant-portal:cert",
] as const;

export function summarizeAccountantPortal(
  deliverables: readonly AccountantPortalDeliverable[],
  ctx: {
    coaCoveragePercent: number;
    reconciliationPercent: number;
    materialVarianceCount: number;
    journalEntryCount: number;
    quickBooksConnected: boolean;
    canExport: boolean;
  },
): AccountantPortalSummary {
  const liveCount = deliverables.filter((d) => d.maturity === "LIVE").length;
  const betaCount = deliverables.filter((d) => d.maturity === "BETA").length;
  const periodCloseReady =
    ctx.coaCoveragePercent >= 100 &&
    ctx.reconciliationPercent >= 80 &&
    ctx.materialVarianceCount === 0 &&
    ctx.journalEntryCount > 0;

  return {
    deliverableCount: deliverables.length,
    liveCount,
    betaCount,
    coaCoveragePercent: ctx.coaCoveragePercent,
    reconciliationPercent: ctx.reconciliationPercent,
    materialVarianceCount: ctx.materialVarianceCount,
    journalEntryCount: ctx.journalEntryCount,
    quickBooksConnected: ctx.quickBooksConnected,
    canExport: ctx.canExport,
    periodCloseReady,
  };
}

export function buildAccountantPortalDeliverables(input: {
  coaCoveragePercent: number;
  reconciliationPercent: number;
  materialVarianceCount: number;
  journalEntryCount: number;
  quickBooksConnected: boolean;
  balanced: boolean;
}): AccountantPortalDeliverable[] {
  return [
    {
      id: "gl_depth_sync",
      pillar: "coa_and_journal_readiness",
      label: "GL-depth accounting sync",
      description: "Chart of accounts, journal entries, and P&L reconciliation baseline.",
      route: "/dashboard/accounting/gl-sync",
      exportRoute: null,
      maturity: "BETA",
      statusLabel: input.balanced ? "Balanced journals" : "Review journal balance",
    },
    {
      id: "coa_mapping",
      pillar: "coa_and_journal_readiness",
      label: "Chart of accounts mapping",
      description: "P&L line → GL code mapping with optional QuickBooks account links.",
      route: "/dashboard/accounting/chart-of-accounts",
      exportRoute: null,
      maturity: input.coaCoveragePercent >= 100 ? "LIVE" : "BETA",
      statusLabel: `${input.coaCoveragePercent}% COA coverage`,
    },
    {
      id: "journal_export",
      pillar: "export_package_hub",
      label: "Journal entry export",
      description: "CSV, JSON, and QuickBooks-mapped journal downloads.",
      route: "/dashboard/accounting/journal-export",
      exportRoute: "/api/export/gl-journal",
      maturity: input.journalEntryCount > 0 ? "LIVE" : "SKIPPED",
      statusLabel:
        input.journalEntryCount > 0
          ? `${input.journalEntryCount} entries ready`
          : "No entries for period",
    },
    {
      id: "pnl_reconciliation",
      pillar: "reconciliation_status",
      label: "P&L reconciliation view",
      description: "Line-by-line operational P&L vs journal GL variance analysis.",
      route: "/dashboard/accounting/pnl-reconciliation",
      exportRoute: "/api/export/pnl-reconciliation",
      maturity: "BETA",
      statusLabel:
        input.materialVarianceCount > 0
          ? `${input.materialVarianceCount} material variance(s)`
          : `${input.reconciliationPercent}% synced`,
    },
    {
      id: "quickbooks",
      pillar: "quickbooks_handoff",
      label: "QuickBooks LIVE handoff",
      description: "OAuth, chart of accounts sync, and daily sales journal.",
      route: "/dashboard/integrations/quickbooks/live",
      exportRoute: null,
      maturity: input.quickBooksConnected ? "LIVE" : "SKIPPED",
      statusLabel: input.quickBooksConnected ? "Connected" : "Not connected",
    },
    {
      id: "bank_reconciliation",
      pillar: "read_only_accountant_posture",
      label: "Bank reconciliation",
      description: "Match bank deposits to operational ledger — read-only for external accountants.",
      route: "/dashboard/accounting/bank-reconciliation",
      exportRoute: null,
      maturity: "BETA",
      statusLabel: "Review deposits vs sales",
    },
    {
      id: "restaurant_pnl",
      pillar: "reconciliation_status",
      label: "Restaurant P&L report",
      description: "Operational P&L statement that feeds journal generation.",
      route: "/dashboard/reports/financial/pnl",
      exportRoute: "/api/export/pnl",
      maturity: "LIVE",
      statusLabel: "Source statement",
    },
  ];
}
