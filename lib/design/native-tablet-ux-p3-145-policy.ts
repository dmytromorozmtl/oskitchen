/**
 * Blueprint P3-145 — Native tablet UX (TouchBistro parity baseline).
 *
 * @see docs/native-tablet-ux-touchbistro.md
 */

export const NATIVE_TABLET_UX_P3_145_POLICY_ID = "native-tablet-ux-p3-145-v1" as const;

export const NATIVE_TABLET_UX_P3_145_DOC = "docs/native-tablet-ux-touchbistro.md" as const;

export const NATIVE_TABLET_UX_P3_145_ARTIFACT =
  "artifacts/native-tablet-ux-touchbistro-registry.json" as const;

export const NATIVE_TABLET_UX_P3_145_AUDIT_SCRIPT =
  "scripts/audit-native-tablet-ux-p3-145.ts" as const;

export const NATIVE_TABLET_UX_P3_145_NPM_SCRIPT = "audit:native-tablet-ux-p3-145" as const;

export const NATIVE_TABLET_UX_P3_145_UNIT_TEST =
  "tests/unit/native-tablet-ux-p3-145.test.ts" as const;

export const NATIVE_TABLET_UX_P3_145_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const NATIVE_TABLET_UX_P3_145_COMPETITOR = "touchbistro" as const;

export const NATIVE_TABLET_UX_P3_145_HEADLINE =
  "Native tablet UX — TouchBistro parity baseline" as const;

export const NATIVE_TABLET_UX_P3_145_ROUTE = "/dashboard/design/native-tablet-ux" as const;

export const NATIVE_TABLET_UX_P3_145_TABLET_POS_ROUTE = "/dashboard/pos/tablet" as const;

export const NATIVE_TABLET_UX_P3_145_TABS_ROUTE = "/dashboard/pos/tabs" as const;

export const NATIVE_TABLET_UX_P3_145_NATIVE_HUB_ROUTE = "/dashboard/pos/native-tablet" as const;

export const NATIVE_TABLET_UX_P3_145_IMPLEMENTATION_REF = "native-tablet-ux-p2-95-v1" as const;

export const NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX = 44 as const;

export const NATIVE_TABLET_UX_P3_145_CAPABILITY_COUNT = 3 as const;

export const NATIVE_TABLET_UX_P3_145_CAPABILITY_IDS = [
  "ipad_layouts",
  "bar_mode",
  "table_tabs",
] as const;

export type NativeTabletUxP3_145CapabilityId =
  (typeof NATIVE_TABLET_UX_P3_145_CAPABILITY_IDS)[number];

export const NATIVE_TABLET_UX_P3_145_TEST_IDS = [
  "native-tablet-ux-touchbistro",
  "native-tablet-ipad-layouts",
  "native-tablet-bar-mode",
  "native-tablet-table-tabs",
] as const;

export const NATIVE_TABLET_UX_P3_145_COMPONENT =
  "components/design/native-tablet-ux-touchbistro-panel.tsx" as const;

export const NATIVE_TABLET_UX_P3_145_PAGE =
  "app/dashboard/design/native-tablet-ux/page.tsx" as const;

export const NATIVE_TABLET_UX_P3_145_P2_95_AUDIT_NPM = "audit:native-tablet-ux-p2-95" as const;

export const NATIVE_TABLET_UX_P3_145_RELATED_DOCS = [
  "docs/competitor-battle-cards/touchbistro.md",
  "docs/native-tablet-ux.md",
  "lib/pos/ipad-native-pos-polish-policy.ts",
  "lib/pos/pos-tablet-layout.ts",
  "components/pos/pos-tablet-client.tsx",
  "components/pos/native-tablet-ux-panel.tsx",
] as const;

export const NATIVE_TABLET_UX_P3_145_HONESTY_MARKERS = [
  "not affiliated",
  "0 signed LOIs",
  "BETA",
  "baseline",
  "verify",
] as const;

export const NATIVE_TABLET_UX_P3_145_WIRING_PATHS = [
  NATIVE_TABLET_UX_P3_145_DOC,
  "lib/design/native-tablet-ux-p3-145-policy.ts",
  "lib/design/native-tablet-ux-p3-145-content.ts",
  "lib/design/native-tablet-ux-p3-145-operations.ts",
  "lib/design/native-tablet-ux-p3-145-audit.ts",
  NATIVE_TABLET_UX_P3_145_ARTIFACT,
  NATIVE_TABLET_UX_P3_145_UNIT_TEST,
  NATIVE_TABLET_UX_P3_145_COMPONENT,
  NATIVE_TABLET_UX_P3_145_PAGE,
  "lib/pos/native-tablet-ux-p2-95-policy.ts",
  "components/pos/native-tablet-ux-panel.tsx",
] as const;
