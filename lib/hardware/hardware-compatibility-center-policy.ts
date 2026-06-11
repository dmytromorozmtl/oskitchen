/**
 * Blueprint P2-87 — Hardware compatibility center ("Works with OS Kitchen").
 *
 * @see docs/hardware-compatibility-center.md
 * @see app/works-with-os-kitchen/page.tsx
 */

export const HARDWARE_COMPATIBILITY_CENTER_POLICY_ID =
  "hardware-compatibility-center-p2-87-v1" as const;

export const HARDWARE_COMPATIBILITY_CENTER_DOC =
  "docs/hardware-compatibility-center.md" as const;

export const HARDWARE_COMPATIBILITY_CENTER_CONTENT_PATH =
  "lib/hardware/hardware-compatibility-center-content.ts" as const;

export const HARDWARE_COMPATIBILITY_CENTER_COMPONENT =
  "components/hardware/hardware-compatibility-center.tsx" as const;

export const HARDWARE_COMPATIBILITY_CENTER_PAGE =
  "app/works-with-os-kitchen/page.tsx" as const;

export const HARDWARE_COMPATIBILITY_CENTER_ROUTE = "/works-with-os-kitchen" as const;

export const HARDWARE_COMPATIBILITY_CENTER_TAGLINE =
  "Works with OS Kitchen" as const;

export const HARDWARE_COMPATIBILITY_CENTER_HEADLINE =
  "Works with OS Kitchen — hardware compatibility center" as const;

export const HARDWARE_COMPATIBILITY_CENTER_TEST_IDS = [
  "hardware-compatibility-center",
  "hardware-test-printer",
  "hardware-test-cash-drawer",
  "hardware-test-kds",
  "hardware-test-network",
] as const;

export type HardwareCompatibilityCenterTestId =
  (typeof HARDWARE_COMPATIBILITY_CENTER_TEST_IDS)[number];

export const HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTIC_COUNT = 4 as const;

export const HARDWARE_COMPATIBILITY_CENTER_HONESTY_MARKERS = [
  "browser-first",
  "verify",
  "BETA",
  "placeholder",
  "typical",
] as const;

export const HARDWARE_COMPATIBILITY_CENTER_AUDIT_SCRIPT =
  "scripts/audit-hardware-compatibility-center.ts" as const;

export const HARDWARE_COMPATIBILITY_CENTER_NPM_SCRIPT =
  "audit:hardware-compatibility-center" as const;

export const HARDWARE_COMPATIBILITY_CENTER_UNIT_TEST =
  "tests/unit/hardware-compatibility-center.test.ts" as const;

export const HARDWARE_COMPATIBILITY_CENTER_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const HARDWARE_COMPATIBILITY_CENTER_WIRING_PATHS = [
  HARDWARE_COMPATIBILITY_CENTER_DOC,
  HARDWARE_COMPATIBILITY_CENTER_CONTENT_PATH,
  HARDWARE_COMPATIBILITY_CENTER_COMPONENT,
  HARDWARE_COMPATIBILITY_CENTER_PAGE,
  "lib/hardware/hardware-compatibility-center-policy.ts",
  "lib/hardware/hardware-compatibility-center-audit.ts",
  "lib/hardware/hardware-compatibility-center-diagnostics.ts",
  HARDWARE_COMPATIBILITY_CENTER_UNIT_TEST,
  "docs/certified-hardware-guide.md",
] as const;
