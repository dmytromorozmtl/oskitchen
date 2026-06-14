/**
 * P3-91 — Native budgeting module: budget vs actual without an accountant (R365 parity).
 *
 * @see docs/native-budgeting-p3-91.md
 * @see app/dashboard/finance/budget/page.tsx
 */

export const NATIVE_BUDGETING_P3_91_POLICY_ID = "native-budgeting-p3-91-v1" as const;

export const NATIVE_BUDGETING_P3_91_DOC = "docs/native-budgeting-p3-91.md" as const;

export const NATIVE_BUDGETING_P3_91_ARTIFACT = "artifacts/native-budgeting-p3-91.json" as const;

export const NATIVE_BUDGETING_P3_91_CONTENT_MODULE =
  "lib/finance/native-budgeting-p3-91-content.ts" as const;

export const NATIVE_BUDGETING_P3_91_SETTINGS_MODULE =
  "lib/finance/native-budgeting-settings.ts" as const;

export const NATIVE_BUDGETING_P3_91_BUILDERS_MODULE =
  "lib/finance/native-budgeting-builders.ts" as const;

export const NATIVE_BUDGETING_P3_91_SERVICE = "services/finance/native-budgeting-service.ts" as const;

export const NATIVE_BUDGETING_P3_91_AUDIT_MODULE =
  "lib/finance/native-budgeting-p3-91-audit.ts" as const;

export const NATIVE_BUDGETING_P3_91_PAGE = "app/dashboard/finance/budget/page.tsx" as const;

export const NATIVE_BUDGETING_P3_91_PANEL =
  "components/dashboard/finance/native-budgeting-panel.tsx" as const;

export const NATIVE_BUDGETING_P3_91_ACTIONS = "actions/finance/native-budgeting.ts" as const;

export const NATIVE_BUDGETING_P3_91_CHECK_NPM_SCRIPT = "check:native-budgeting-p3-91" as const;

export const NATIVE_BUDGETING_P3_91_UNIT_TEST = "tests/unit/native-budgeting-p3-91.test.ts" as const;

export const NATIVE_BUDGETING_P3_91_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const NATIVE_BUDGETING_P3_91_CANONICAL_PATH = "/dashboard/finance/budget" as const;

export const NATIVE_BUDGETING_P3_91_PNL_PATH = "/dashboard/reports/financial/pnl" as const;

export const NATIVE_BUDGETING_P3_91_MIN_CATEGORIES = 8 as const;

export const NATIVE_BUDGETING_P3_91_WIRING_PATHS = [
  NATIVE_BUDGETING_P3_91_DOC,
  NATIVE_BUDGETING_P3_91_ARTIFACT,
  NATIVE_BUDGETING_P3_91_CONTENT_MODULE,
  NATIVE_BUDGETING_P3_91_SETTINGS_MODULE,
  NATIVE_BUDGETING_P3_91_BUILDERS_MODULE,
  NATIVE_BUDGETING_P3_91_SERVICE,
  NATIVE_BUDGETING_P3_91_AUDIT_MODULE,
  NATIVE_BUDGETING_P3_91_PAGE,
  NATIVE_BUDGETING_P3_91_PANEL,
  NATIVE_BUDGETING_P3_91_ACTIONS,
  NATIVE_BUDGETING_P3_91_UNIT_TEST,
  NATIVE_BUDGETING_P3_91_CI_WORKFLOW,
  "services/accounting/restaurant-pnl-service.ts",
] as const;
