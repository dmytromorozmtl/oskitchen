import {
  ACCOUNTING_DEPTH_P3_149_CAPABILITY_COUNT,
  ACCOUNTING_DEPTH_P3_149_ROUTE,
  type AccountingDepthCapabilityId,
} from "@/lib/accounting/accounting-depth-p3-149-policy";

export const ACCOUNTING_DEPTH_P3_149_EYEBROW =
  "R365 parity · accounting depth" as const;

export const ACCOUNTING_DEPTH_P3_149_SUBLINE =
  "Six accounting surfaces — chart of accounts, journal entries, GL sync, P&L reconciliation, period-close checklist, and AP automation. BETA baseline — not a certified GL; verify with accountant before period close." as const;

export type AccountingDepthCapability = {
  id: AccountingDepthCapabilityId;
  label: string;
  route: string;
  testId: string;
  r365Typical: string;
  osKitchenStatus: string;
};

export const ACCOUNTING_DEPTH_P3_149_CAPABILITIES: readonly AccountingDepthCapability[] = [
  {
    id: "chart_of_accounts",
    label: "Chart of accounts",
    route: "/dashboard/accounting/chart-of-accounts",
    testId: "accounting-depth-coa",
    r365Typical: "Enterprise GL chart with multi-entity rollups",
    osKitchenStatus: "shipped",
  },
  {
    id: "journal_entries",
    label: "Journal entries",
    route: "/dashboard/accounting/journal-export",
    testId: "accounting-depth-journal",
    r365Typical: "Automated journal posting from operations",
    osKitchenStatus: "shipped",
  },
  {
    id: "gl_depth_sync",
    label: "GL depth sync",
    route: "/dashboard/accounting/gl-sync",
    testId: "accounting-depth-gl-sync",
    r365Typical: "Operational-to-GL sync pipeline",
    osKitchenStatus: "shipped",
  },
  {
    id: "pnl_reconciliation",
    label: "P&L reconciliation",
    route: "/dashboard/accounting/pnl-reconciliation",
    testId: "accounting-depth-reconciliation",
    r365Typical: "Statement vs GL variance analysis",
    osKitchenStatus: "BETA",
  },
  {
    id: "period_close",
    label: "Period close",
    route: "/dashboard/accounting/accountant-portal",
    testId: "accounting-depth-period-close",
    r365Typical: "Month-end close checklist and sign-off",
    osKitchenStatus: "BETA",
  },
  {
    id: "ap_automation",
    label: "AP automation",
    route: "/dashboard/accounting/ap-automation",
    testId: "accounting-depth-ap",
    r365Typical: "Invoice → PO → payment workflow",
    osKitchenStatus: "BETA",
  },
] as const;

export function assertAccountingDepthCapabilityCount(): boolean {
  return (
    ACCOUNTING_DEPTH_P3_149_CAPABILITIES.length === ACCOUNTING_DEPTH_P3_149_CAPABILITY_COUNT
  );
}

export const ACCOUNTING_DEPTH_P3_149_OPERATOR_LINKS = [
  { label: "Accounting depth hub", href: ACCOUNTING_DEPTH_P3_149_ROUTE },
  { label: "Accountant portal", href: "/dashboard/accounting/accountant-portal" },
  { label: "Restaurant P&L", href: "/dashboard/reports/financial/pnl" },
] as const;
