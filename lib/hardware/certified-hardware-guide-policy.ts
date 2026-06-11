/**
 * Blueprint P2-86 — Certified hardware guide (7 operator categories).
 *
 * @see docs/certified-hardware-guide.md
 * @see docs/hardware-compatibility.md
 */

export const CERTIFIED_HARDWARE_GUIDE_POLICY_ID = "certified-hardware-guide-p2-86-v1" as const;

export const CERTIFIED_HARDWARE_GUIDE_DOC = "docs/certified-hardware-guide.md" as const;

export const CERTIFIED_HARDWARE_GUIDE_CONTENT_PATH =
  "lib/hardware/certified-hardware-guide-content.ts" as const;

export const CERTIFIED_HARDWARE_GUIDE_COMPAT_DOC = "docs/hardware-compatibility.md" as const;

export const CERTIFIED_HARDWARE_GUIDE_CATALOG_PATH =
  "lib/pos/pos-hardware-certification.ts" as const;

export const CERTIFIED_HARDWARE_GUIDE_POSITIONING_DOC =
  "docs/software-first-pos-positioning.md" as const;

export const CERTIFIED_HARDWARE_GUIDE_CATEGORY_COUNT = 7 as const;

export type CertifiedHardwareGuideCategoryId =
  | "ipad_tablets"
  | "receipt_printers"
  | "kitchen_screens"
  | "cash_drawers"
  | "barcode_scanners"
  | "label_printers"
  | "payment_terminals";

export const CERTIFIED_HARDWARE_GUIDE_CATEGORY_IDS = [
  "ipad_tablets",
  "receipt_printers",
  "kitchen_screens",
  "cash_drawers",
  "barcode_scanners",
  "label_printers",
  "payment_terminals",
] as const satisfies readonly CertifiedHardwareGuideCategoryId[];

export const CERTIFIED_HARDWARE_GUIDE_HONESTY_MARKERS = [
  "browser-first",
  "verify",
  "BETA",
  "not required",
  "typical",
] as const;

export const CERTIFIED_HARDWARE_GUIDE_AUDIT_SCRIPT =
  "scripts/audit-certified-hardware-guide.ts" as const;

export const CERTIFIED_HARDWARE_GUIDE_NPM_SCRIPT = "audit:certified-hardware-guide" as const;

export const CERTIFIED_HARDWARE_GUIDE_UNIT_TEST =
  "tests/unit/certified-hardware-guide.test.ts" as const;

export const CERTIFIED_HARDWARE_GUIDE_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const CERTIFIED_HARDWARE_GUIDE_WIRING_PATHS = [
  CERTIFIED_HARDWARE_GUIDE_DOC,
  CERTIFIED_HARDWARE_GUIDE_CONTENT_PATH,
  CERTIFIED_HARDWARE_GUIDE_COMPAT_DOC,
  CERTIFIED_HARDWARE_GUIDE_CATALOG_PATH,
  CERTIFIED_HARDWARE_GUIDE_POSITIONING_DOC,
  "lib/hardware/certified-hardware-guide-policy.ts",
  "lib/hardware/certified-hardware-guide-audit.ts",
  CERTIFIED_HARDWARE_GUIDE_UNIT_TEST,
] as const;
