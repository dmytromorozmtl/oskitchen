/**
 * Blueprint P3-141 — Hardware bundle story (Toast parity: bundle + payment terminal).
 *
 * @see docs/hardware-bundle-story.md
 */

export const HARDWARE_BUNDLE_STORY_P3_141_POLICY_ID = "hardware-bundle-story-p3-141-v1" as const;

export const HARDWARE_BUNDLE_STORY_P3_141_DOC = "docs/hardware-bundle-story.md" as const;

export const HARDWARE_BUNDLE_STORY_P3_141_ARTIFACT =
  "artifacts/hardware-bundle-story-registry.json" as const;

export const HARDWARE_BUNDLE_STORY_P3_141_AUDIT_SCRIPT =
  "scripts/audit-hardware-bundle-story-p3-141.ts" as const;

export const HARDWARE_BUNDLE_STORY_P3_141_NPM_SCRIPT = "audit:hardware-bundle-story-p3-141" as const;

export const HARDWARE_BUNDLE_STORY_P3_141_UNIT_TEST =
  "tests/unit/hardware-bundle-story-p3-141.test.ts" as const;

export const HARDWARE_BUNDLE_STORY_P3_141_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const HARDWARE_BUNDLE_STORY_P3_141_COMPETITOR = "toast" as const;

export const HARDWARE_BUNDLE_STORY_P3_141_POSITIONING_LINE =
  "Hardware shouldn't lock you in." as const;

export const HARDWARE_BUNDLE_STORY_P3_141_IMPLEMENTATION_REF =
  "certified-hardware-guide-p2-86-v1" as const;

export const HARDWARE_BUNDLE_STORY_P3_141_BUNDLE_COMPONENT_IDS = [
  "ipad_tablet",
  "receipt_printer",
  "kitchen_screen",
  "cash_drawer",
  "payment_terminal",
  "barcode_scanner",
  "label_printer",
] as const;

export type HardwareBundleStoryComponentId =
  (typeof HARDWARE_BUNDLE_STORY_P3_141_BUNDLE_COMPONENT_IDS)[number];

export const HARDWARE_BUNDLE_STORY_P3_141_LIVE_AUDIT_NPM =
  "audit:certified-hardware-guide" as const;

export const HARDWARE_BUNDLE_STORY_P3_141_RELATED_DOCS = [
  "docs/certified-hardware-guide.md",
  "docs/software-first-pos-positioning.md",
  "docs/competitor-battle-cards/toast.md",
  "docs/hardware-compatibility.md",
  "lib/pos/pos-hardware-certification.ts",
  "lib/hardware/certified-hardware-guide-policy.ts",
] as const;

export const HARDWARE_BUNDLE_STORY_P3_141_HONESTY_MARKERS = [
  "not affiliated",
  "browser-first",
  "0 signed LOIs",
  "BETA",
  "baseline",
  "verify",
] as const;

export const HARDWARE_BUNDLE_STORY_P3_141_WIRING_PATHS = [
  HARDWARE_BUNDLE_STORY_P3_141_DOC,
  "lib/hardware/hardware-bundle-story-p3-141-policy.ts",
  "lib/hardware/hardware-bundle-story-p3-141-operations.ts",
  "lib/hardware/hardware-bundle-story-p3-141-audit.ts",
  HARDWARE_BUNDLE_STORY_P3_141_ARTIFACT,
  HARDWARE_BUNDLE_STORY_P3_141_UNIT_TEST,
] as const;
