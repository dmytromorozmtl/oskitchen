/**
 * Blueprint P3-80 — Hardware compatibility center ("Works with OS Kitchen").
 *
 * @see docs/hardware-compatibility-center-p3-80.md
 */

import {
  HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTIC_COUNT,
  HARDWARE_COMPATIBILITY_CENTER_POLICY_ID,
  HARDWARE_COMPATIBILITY_CENTER_ROUTE,
  HARDWARE_COMPATIBILITY_CENTER_TAGLINE,
} from "@/lib/hardware/hardware-compatibility-center-policy";

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_POLICY_ID =
  "hardware-compatibility-center-p3-80-v1" as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_DOC =
  "docs/hardware-compatibility-center-p3-80.md" as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_ARTIFACT =
  "artifacts/hardware-compatibility-center-p3-80-registry.json" as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_AUDIT_SCRIPT =
  "scripts/audit-hardware-compatibility-center-p3-80.ts" as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_NPM_SCRIPT =
  "audit:hardware-compatibility-center-p3-80" as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_CHECK_NPM_SCRIPT =
  "check:hardware-compatibility-center-p3-80" as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_UNIT_TEST =
  "tests/unit/hardware-compatibility-center-p3-80.test.ts" as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_UPSTREAM_POLICY_ID =
  HARDWARE_COMPATIBILITY_CENTER_POLICY_ID;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_UPSTREAM_TEST =
  "tests/unit/hardware-compatibility-center.test.ts" as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_PAGE =
  "app/works-with-os-kitchen/page.tsx" as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_ROADMAP_DOC =
  "docs/hardware-compatibility-roadmap-toast.md" as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_CERTIFIED_DOC =
  "docs/certified-devices-ipad.md" as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_NPM_SCRIPTS = [
  "test:ci:hardware-compatibility-center",
  "test:ci:hardware-compatibility-center-p3-80:cert",
] as const;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_DIAGNOSTIC_COUNT =
  HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTIC_COUNT;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_ROUTE = HARDWARE_COMPATIBILITY_CENTER_ROUTE;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_TAGLINE = HARDWARE_COMPATIBILITY_CENTER_TAGLINE;

export const HARDWARE_COMPATIBILITY_CENTER_P3_80_WIRING_PATHS = [
  HARDWARE_COMPATIBILITY_CENTER_P3_80_DOC,
  "docs/hardware-compatibility-center.md",
  "lib/hardware/hardware-compatibility-center-policy.ts",
  "lib/hardware/hardware-compatibility-center-content.ts",
  "lib/hardware/hardware-compatibility-center-diagnostics.ts",
  "lib/hardware/hardware-compatibility-center-audit.ts",
  "lib/hardware/hardware-compatibility-center-p3-80-measurement.ts",
  "lib/hardware/hardware-compatibility-center-p3-80-audit.ts",
  "components/hardware/hardware-compatibility-center.tsx",
  HARDWARE_COMPATIBILITY_CENTER_P3_80_PAGE,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_ROADMAP_DOC,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_CERTIFIED_DOC,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_UNIT_TEST,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_UPSTREAM_TEST,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_ARTIFACT,
] as const;
