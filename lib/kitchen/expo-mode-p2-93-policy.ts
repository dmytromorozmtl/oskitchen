/**
 * Blueprint P2-93 — Expo mode (order completeness, missing items, handoff checklist).
 *
 * @see docs/expo-mode.md
 * @see app/dashboard/kitchen/expo/page.tsx
 */

export const EXPO_MODE_POLICY_ID = "expo-mode-p2-93-v1" as const;

export const EXPO_MODE_DOC = "docs/expo-mode.md" as const;

export const EXPO_MODE_CONTENT_PATH = "lib/kitchen/expo-mode-p2-93-content.ts" as const;

export const EXPO_MODE_OPERATIONS_PATH = "lib/kitchen/expo-mode-p2-93-operations.ts" as const;

export const EXPO_MODE_SERVICE_PATH = "services/kitchen/expo-mode-p2-93-service.ts" as const;

export const EXPO_MODE_COMPONENT = "components/kitchen/expo-mode-panel.tsx" as const;

export const EXPO_MODE_PAGE = "app/dashboard/kitchen/expo/page.tsx" as const;

export const EXPO_MODE_ROUTE = "/dashboard/kitchen/expo" as const;

export const EXPO_MODE_CAPABILITY_COUNT = 3 as const;

export const EXPO_MODE_TEST_IDS = [
  "expo-mode",
  "expo-order-completeness",
  "expo-missing-items",
  "expo-handoff-checklist",
] as const;

export const EXPO_MODE_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "expo",
  "not certified",
] as const;

export const EXPO_MODE_AUDIT_SCRIPT = "scripts/audit-expo-mode.ts" as const;

export const EXPO_MODE_NPM_SCRIPT = "audit:expo-mode" as const;

export const EXPO_MODE_UNIT_TEST = "tests/unit/expo-mode.test.ts" as const;

export const EXPO_MODE_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const EXPO_MODE_WIRING_PATHS = [
  EXPO_MODE_DOC,
  EXPO_MODE_CONTENT_PATH,
  EXPO_MODE_OPERATIONS_PATH,
  EXPO_MODE_SERVICE_PATH,
  EXPO_MODE_COMPONENT,
  EXPO_MODE_PAGE,
  "lib/kitchen/expo-mode-p2-93-policy.ts",
  "lib/kitchen/expo-mode-p2-93-audit.ts",
  "actions/kitchen-daily-kds.ts",
  "services/kitchen-screen/daily-kds-service.ts",
  EXPO_MODE_UNIT_TEST,
] as const;
