/**
 * Blueprint P2-95 — Native tablet UX (iPad layouts, bar/table/tabs polish).
 *
 * @see docs/native-tablet-ux.md
 * @see app/dashboard/pos/native-tablet/page.tsx
 */

export const NATIVE_TABLET_UX_P2_95_POLICY_ID = "native-tablet-ux-p2-95-v1" as const;

export const NATIVE_TABLET_UX_P2_95_DOC = "docs/native-tablet-ux.md" as const;

export const NATIVE_TABLET_UX_P2_95_LEGACY_POLICY = "lib/pos/ipad-native-pos-polish-policy.ts" as const;

export const NATIVE_TABLET_UX_P2_95_CONTENT_PATH =
  "lib/pos/native-tablet-ux-p2-95-content.ts" as const;

export const NATIVE_TABLET_UX_P2_95_OPERATIONS_PATH =
  "lib/pos/native-tablet-ux-p2-95-operations.ts" as const;

export const NATIVE_TABLET_UX_P2_95_SERVICE_PATH =
  "services/pos/native-tablet-ux-p2-95-service.ts" as const;

export const NATIVE_TABLET_UX_P2_95_COMPONENT =
  "components/pos/native-tablet-ux-panel.tsx" as const;

export const NATIVE_TABLET_UX_P2_95_PAGE = "app/dashboard/pos/native-tablet/page.tsx" as const;

export const NATIVE_TABLET_UX_P2_95_ROUTE = "/dashboard/pos/native-tablet" as const;

export const NATIVE_TABLET_UX_P2_95_TABLET_POS_ROUTE = "/dashboard/pos/tablet" as const;

export const NATIVE_TABLET_UX_P2_95_TABS_ROUTE = "/dashboard/pos/tabs" as const;

export const NATIVE_TABLET_UX_P2_95_CAPABILITY_COUNT = 3 as const;

export const NATIVE_TABLET_UX_P2_95_TEST_IDS = [
  "native-tablet-ux",
  "native-tablet-ipad-layouts",
  "native-tablet-bar-mode",
  "native-tablet-table-tabs",
] as const;

export const NATIVE_TABLET_UX_P2_95_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "tablet",
  "not certified",
] as const;

export const NATIVE_TABLET_UX_P2_95_AUDIT_SCRIPT =
  "scripts/audit-native-tablet-ux-p2-95.ts" as const;

export const NATIVE_TABLET_UX_P2_95_NPM_SCRIPT = "audit:native-tablet-ux-p2-95" as const;

export const NATIVE_TABLET_UX_P2_95_UNIT_TEST = "tests/unit/native-tablet-ux-p2-95.test.ts" as const;

export const NATIVE_TABLET_UX_P2_95_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const NATIVE_TABLET_UX_P2_95_WIRING_PATHS = [
  NATIVE_TABLET_UX_P2_95_DOC,
  NATIVE_TABLET_UX_P2_95_CONTENT_PATH,
  NATIVE_TABLET_UX_P2_95_OPERATIONS_PATH,
  NATIVE_TABLET_UX_P2_95_SERVICE_PATH,
  NATIVE_TABLET_UX_P2_95_COMPONENT,
  NATIVE_TABLET_UX_P2_95_PAGE,
  "lib/pos/native-tablet-ux-p2-95-policy.ts",
  "lib/pos/native-tablet-ux-p2-95-audit.ts",
  "lib/pos/pos-tablet-layout.ts",
  "lib/pos/touch-targets.ts",
  "components/pos/tab-panel.tsx",
  "components/pos/pos-tablet-client.tsx",
  NATIVE_TABLET_UX_P2_95_UNIT_TEST,
  NATIVE_TABLET_UX_P2_95_LEGACY_POLICY,
] as const;
