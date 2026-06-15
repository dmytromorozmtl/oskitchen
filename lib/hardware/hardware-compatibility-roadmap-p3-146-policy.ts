/**
 * Blueprint P3-146 — Hardware compatibility roadmap (Clover parity baseline).
 *
 * @see docs/hardware-compatibility-roadmap.md
 */

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POLICY_ID =
  "hardware-compatibility-roadmap-p3-146-v1" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_DOC =
  "docs/hardware-compatibility-roadmap.md" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ARTIFACT =
  "artifacts/hardware-compatibility-roadmap-registry.json" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_AUDIT_SCRIPT =
  "scripts/audit-hardware-compatibility-roadmap-p3-146.ts" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_NPM_SCRIPT =
  "audit:hardware-compatibility-roadmap-p3-146" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_UNIT_TEST =
  "tests/unit/hardware-compatibility-roadmap-p3-146.test.ts" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_COMPETITOR = "clover" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_POSITIONING_LINE =
  "Bring your own devices — no Fiserv lease." as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_HEADLINE =
  "Hardware compatibility roadmap — Clover parity baseline" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROUTE = "/works-with-os-kitchen" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_IMPLEMENTATION_REF =
  "hardware-compatibility-center-p2-87-v1" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_SECONDARY_REF =
  "certified-hardware-guide-p2-86-v1" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_COUNT = 6 as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_IDS = [
  "clover_station",
  "clover_mini",
  "clover_flex",
  "fiserv_payments",
  "printer_diagnostics",
  "compat_center",
] as const;

export type HardwareCompatibilityRoadmapItemId =
  (typeof HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_IDS)[number];

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_LIVE_COMPAT_CENTER_AUDIT =
  "audit:hardware-compatibility-center" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_LIVE_CERTIFIED_GUIDE_AUDIT =
  "audit:certified-hardware-guide" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_RELATED_DOCS = [
  "docs/competitor-battle-cards/clover.md",
  "docs/hardware-compatibility-center.md",
  "docs/certified-hardware-guide.md",
  "docs/hardware-bundle-story.md",
  "docs/hardware-compatibility.md",
  "lib/hardware/hardware-compatibility-center-policy.ts",
] as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_HONESTY_MARKERS = [
  "not affiliated",
  "browser-first",
  "0 signed LOIs",
  "BETA",
  "baseline",
  "verify",
] as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_WIRING_PATHS = [
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_DOC,
  "lib/hardware/hardware-compatibility-roadmap-p3-146-policy.ts",
  "lib/hardware/hardware-compatibility-roadmap-p3-146-content.ts",
  "lib/hardware/hardware-compatibility-roadmap-p3-146-operations.ts",
  "lib/hardware/hardware-compatibility-roadmap-p3-146-audit.ts",
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ARTIFACT,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_UNIT_TEST,
] as const;
