/**
 * P1-25 — Remove hardware roadmap promises from marketing (no "hardware coming soon").
 *
 * @see docs/remove-hardware-roadmap-p1-25.md
 */

export const REMOVE_HARDWARE_ROADMAP_P1_25_POLICY_ID =
  "remove-hardware-roadmap-p1-25-v1" as const;

export const REMOVE_HARDWARE_ROADMAP_P1_25_DOC =
  "docs/remove-hardware-roadmap-p1-25.md" as const;

export const REMOVE_HARDWARE_ROADMAP_P1_25_ARTIFACT =
  "artifacts/remove-hardware-roadmap-p1-25.json" as const;

export const REMOVE_HARDWARE_ROADMAP_P1_25_AUDIT_MODULE =
  "lib/marketing/remove-hardware-roadmap-p1-25-audit.ts" as const;

export const REMOVE_HARDWARE_ROADMAP_P1_25_CHECK_NPM_SCRIPT =
  "check:remove-hardware-roadmap-p1-25" as const;

export const REMOVE_HARDWARE_ROADMAP_P1_25_CI_NPM_SCRIPT =
  "test:ci:remove-hardware-roadmap-p1-25" as const;

export const REMOVE_HARDWARE_ROADMAP_P1_25_UNIT_TEST =
  "tests/unit/remove-hardware-roadmap-p1-25.test.ts" as const;

export const REMOVE_HARDWARE_ROADMAP_P1_25_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

/** Banned in GTM/marketing copy — native hardware ecosystem is deferred, not teased. */
export const REMOVE_HARDWARE_ROADMAP_P1_25_BANNED_PHRASES = [
  "hardware coming soon",
  "Hardware coming soon",
  "native terminal coming soon",
  "proprietary hardware coming soon",
  "hardware bundle coming soon",
  "packing labels roadmap",
  "hardware roadmap promises",
  "Toast Go equivalent coming soon",
  "certified hardware coming soon",
] as const;

export const REMOVE_HARDWARE_ROADMAP_P1_25_SCAN_PATHS = [
  "lib/marketing",
  "components/marketing",
  "docs/no-hardware-lock-in-positioning.md",
  "docs/hardware-bundle-story.md",
  "docs/software-first-pos-positioning.md",
  "docs/hardware-compatibility-roadmap.md",
  "docs/hardware-compatibility-roadmap-toast.md",
  "marketing/forbidden-claims-training.md",
] as const;

export const REMOVE_HARDWARE_ROADMAP_P1_25_DEFERRAL_LINE =
  "Native payment terminals and proprietary hardware ecosystem are deferred — use browser POS and optional Stripe Terminal (BETA) today." as const;

export const REMOVE_HARDWARE_ROADMAP_P1_25_SCAN_EXCLUDE_FILES = [
  "lib/marketing/remove-hardware-roadmap-p1-25-policy.ts",
  "tests/unit/remove-hardware-roadmap-p1-25.test.ts",
] as const;

export const REMOVE_HARDWARE_ROADMAP_P1_25_WIRING_PATHS = [
  REMOVE_HARDWARE_ROADMAP_P1_25_DOC,
  REMOVE_HARDWARE_ROADMAP_P1_25_AUDIT_MODULE,
  REMOVE_HARDWARE_ROADMAP_P1_25_UNIT_TEST,
  REMOVE_HARDWARE_ROADMAP_P1_25_ARTIFACT,
  REMOVE_HARDWARE_ROADMAP_P1_25_CI_WORKFLOW,
  "lib/marketing/forbidden-claims-cheat-sheet-content.ts",
] as const;
