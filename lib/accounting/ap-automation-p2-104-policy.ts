/**
 * Blueprint P2-104 — AP automation (invoice → PO → payment workflow).
 *
 * @see docs/ap-automation.md
 * @see app/dashboard/accounting/ap-automation/page.tsx
 */

export const AP_AUTOMATION_P2_104_POLICY_ID = "ap-automation-p2-104-v1" as const;

export const AP_AUTOMATION_P2_104_DOC = "docs/ap-automation.md" as const;

export const AP_AUTOMATION_P2_104_LEGACY_AP_POLICY = "services/accounting/ap-service.ts" as const;

export const AP_AUTOMATION_P2_104_LEGACY_ACTIONS = "actions/accounting/ap.ts" as const;

export const AP_AUTOMATION_P2_104_LEGACY_SCANNER =
  "services/ai/invoice-scanner-service.ts" as const;

export const AP_AUTOMATION_P2_104_CONTENT_PATH =
  "lib/accounting/ap-automation-p2-104-content.ts" as const;

export const AP_AUTOMATION_P2_104_OPERATIONS_PATH =
  "lib/accounting/ap-automation-p2-104-operations.ts" as const;

export const AP_AUTOMATION_P2_104_SERVICE_PATH =
  "services/accounting/ap-automation-p2-104-service.ts" as const;

export const AP_AUTOMATION_P2_104_COMPONENT =
  "components/accounting/ap-automation-panel.tsx" as const;

export const AP_AUTOMATION_P2_104_PAGE = "app/dashboard/accounting/ap-automation/page.tsx" as const;

export const AP_AUTOMATION_P2_104_ROUTE = "/dashboard/accounting/ap-automation" as const;

export const AP_AUTOMATION_P2_104_INVOICES_ROUTE = "/dashboard/accounting/invoices" as const;

export const AP_AUTOMATION_P2_104_PAYMENTS_ROUTE = "/dashboard/accounting/vendor-payments" as const;

export const AP_AUTOMATION_P2_104_CAPABILITY_COUNT = 3 as const;

export const AP_AUTOMATION_P2_104_TEST_IDS = [
  "ap-automation",
  "ap-invoice-intake",
  "ap-po-matching",
  "ap-payment-release",
] as const;

export const AP_AUTOMATION_P2_104_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const AP_AUTOMATION_P2_104_AUDIT_SCRIPT = "scripts/audit-ap-automation-p2-104.ts" as const;

export const AP_AUTOMATION_P2_104_NPM_SCRIPT = "audit:ap-automation-p2-104" as const;

export const AP_AUTOMATION_P2_104_UNIT_TEST = "tests/unit/ap-automation-p2-104.test.ts" as const;

export const AP_AUTOMATION_P2_104_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const AP_AUTOMATION_P2_104_WIRING_PATHS = [
  AP_AUTOMATION_P2_104_DOC,
  AP_AUTOMATION_P2_104_CONTENT_PATH,
  AP_AUTOMATION_P2_104_OPERATIONS_PATH,
  AP_AUTOMATION_P2_104_SERVICE_PATH,
  AP_AUTOMATION_P2_104_COMPONENT,
  AP_AUTOMATION_P2_104_PAGE,
  "lib/accounting/ap-automation-p2-104-policy.ts",
  "lib/accounting/ap-automation-p2-104-audit.ts",
  AP_AUTOMATION_P2_104_UNIT_TEST,
  AP_AUTOMATION_P2_104_LEGACY_AP_POLICY,
  AP_AUTOMATION_P2_104_LEGACY_ACTIONS,
  AP_AUTOMATION_P2_104_LEGACY_SCANNER,
] as const;
