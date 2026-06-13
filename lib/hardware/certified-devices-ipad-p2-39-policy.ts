/**
 * Blueprint P2-39 — Certified devices: iPad models list.
 *
 * @see docs/certified-devices-ipad.md
 */

export const CERTIFIED_DEVICES_IPAD_P2_39_POLICY_ID = "certified-devices-ipad-p2-39-v1" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_DOC = "docs/certified-devices-ipad.md" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_ARTIFACT =
  "artifacts/certified-devices-ipad-p2-39-registry.json" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_AUDIT_SCRIPT =
  "scripts/audit-certified-devices-ipad-p2-39.ts" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_NPM_SCRIPT = "audit:certified-devices-ipad-p2-39" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_CHECK_NPM_SCRIPT =
  "check:certified-devices-ipad-p2-39" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_UNIT_TEST =
  "tests/unit/certified-devices-ipad-p2-39.test.ts" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_MODEL_COUNT = 10 as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS = "16" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_TABLET_POS_ROUTE = "/dashboard/pos/tablet" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_KDS_ROUTE = "/dashboard/kitchen" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_HANDHELD_ROUTE = "/dashboard/pos/handheld" as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_RELATED_DOCS = [
  "docs/certified-hardware-guide.md",
  "docs/hardware-compatibility-roadmap-toast.md",
  "docs/hardware-compatibility.md",
] as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_HONESTY_MARKERS = [
  "browser-first",
  "Safari PWA",
  "not a native iOS app",
  "verify",
  "legacy",
] as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_WIRING_PATHS = [
  CERTIFIED_DEVICES_IPAD_P2_39_DOC,
  "lib/hardware/certified-devices-ipad-p2-39-policy.ts",
  "lib/hardware/certified-devices-ipad-p2-39-content.ts",
  "lib/hardware/certified-devices-ipad-p2-39-audit.ts",
  CERTIFIED_DEVICES_IPAD_P2_39_ARTIFACT,
  CERTIFIED_DEVICES_IPAD_P2_39_UNIT_TEST,
] as const;
