/**
 * Blueprint P2-37 — Hardware compatibility roadmap (Toast parity baseline).
 *
 * USB/Bluetooth receipt printers + iPad counter mounts.
 *
 * @see docs/hardware-compatibility-roadmap-toast.md
 */

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_POLICY_ID =
  "hardware-compatibility-roadmap-p2-37-v1" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DOC =
  "docs/hardware-compatibility-roadmap-toast.md" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ARTIFACT =
  "artifacts/hardware-compatibility-roadmap-p2-37-registry.json" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_AUDIT_SCRIPT =
  "scripts/audit-hardware-compatibility-roadmap-p2-37.ts" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_NPM_SCRIPT =
  "audit:hardware-compatibility-roadmap-p2-37" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_CHECK_NPM_SCRIPT =
  "check:hardware-compatibility-roadmap-p2-37" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_UNIT_TEST =
  "tests/unit/hardware-compatibility-roadmap-p2-37.test.ts" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_COMPETITOR = "toast" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_POSITIONING_LINE =
  "Bring your own iPad and printers — no Toast hardware lease." as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_HEADLINE =
  "Hardware compatibility roadmap — Toast parity baseline" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROUTE = "/works-with-os-kitchen" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_COUNT = 6 as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_IDS = [
  "usb_receipt_printer",
  "bluetooth_receipt_printer",
  "ipad_counter_mount",
  "toast_go_handheld",
  "printer_diagnostics",
  "native_escpos_roadmap",
] as const;

export type HardwareCompatibilityRoadmapP2_37ItemId =
  (typeof HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_IDS)[number];

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_LIVE_COMPAT_CENTER_AUDIT =
  "audit:hardware-compatibility-center" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_LIVE_CERTIFIED_GUIDE_AUDIT =
  "audit:certified-hardware-guide" as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_RELATED_DOCS = [
  "docs/competitor-battle-cards/toast.md",
  "docs/hardware-compatibility.md",
  "docs/certified-hardware-guide.md",
  "docs/POS_HARDWARE_READINESS.md",
  "lib/pos/pos-hardware.ts",
] as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_HONESTY_MARKERS = [
  "not affiliated",
  "browser-first",
  "BETA",
  "roadmap",
  "verify",
  "0 signed LOIs",
] as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_WIRING_PATHS = [
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DOC,
  "lib/hardware/hardware-compatibility-roadmap-p2-37-policy.ts",
  "lib/hardware/hardware-compatibility-roadmap-p2-37-content.ts",
  "lib/hardware/hardware-compatibility-roadmap-p2-37-audit.ts",
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ARTIFACT,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_UNIT_TEST,
] as const;
