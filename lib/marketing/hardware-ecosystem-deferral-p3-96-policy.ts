/**
 * P3-96 — Proprietary hardware ecosystem deferred; software-first BYOD.
 *
 * @see docs/hardware-ecosystem-deferral-p3-96.md
 * @see lib/marketing/public-roadmap-content.ts
 */

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_POLICY_ID =
  "hardware-ecosystem-deferral-p3-96-v1" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_DOC =
  "docs/hardware-ecosystem-deferral-p3-96.md" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ARTIFACT =
  "artifacts/hardware-ecosystem-deferral-p3-96.json" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_CONTENT_MODULE =
  "lib/marketing/hardware-ecosystem-deferral-p3-96-content.ts" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_AUDIT_MODULE =
  "lib/marketing/hardware-ecosystem-deferral-p3-96-audit.ts" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_CHECK_NPM_SCRIPT =
  "check:hardware-ecosystem-deferral-p3-96" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UNIT_TEST =
  "tests/unit/hardware-ecosystem-deferral-p3-96.test.ts" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ROADMAP_ITEM_ID =
  "hardware-ecosystem" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UPSTREAM_ROADMAP =
  "lib/marketing/public-roadmap-content.ts" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UPSTREAM_PRODUCT_ROADMAP =
  "docs/PRODUCT_ROADMAP_2026.md" as const;

export const HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_WIRING_PATHS = [
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_DOC,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_ARTIFACT,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_CONTENT_MODULE,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_AUDIT_MODULE,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UNIT_TEST,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_CI_WORKFLOW,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UPSTREAM_ROADMAP,
  HARDWARE_ECOSYSTEM_DEFERRAL_P3_96_UPSTREAM_PRODUCT_ROADMAP,
] as const;
