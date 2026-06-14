/**
 * P3-88 — Public /roadmap honest quarter dates; no undated hardware promises.
 *
 * @see docs/public-roadmap-honest-dates-p3-88.md
 * @see docs/public-roadmap-p3-69.md
 * @see lib/marketing/remove-hardware-roadmap-p1-25-policy.ts
 */

import { PUBLIC_ROADMAP_PATH } from "@/lib/marketing/public-roadmap-content";

export const PUBLIC_ROADMAP_P3_88_POLICY_ID =
  "public-roadmap-honest-dates-p3-88-v1" as const;

export const PUBLIC_ROADMAP_P3_88_DOC = "docs/public-roadmap-honest-dates-p3-88.md" as const;

export const PUBLIC_ROADMAP_P3_88_ARTIFACT =
  "artifacts/public-roadmap-honest-dates-p3-88.json" as const;

export const PUBLIC_ROADMAP_P3_88_MEASUREMENT_MODULE =
  "lib/marketing/public-roadmap-honest-dates-p3-88-measurement.ts" as const;

export const PUBLIC_ROADMAP_P3_88_AUDIT_MODULE =
  "lib/marketing/public-roadmap-honest-dates-p3-88-audit.ts" as const;

export const PUBLIC_ROADMAP_P3_88_CHECK_NPM_SCRIPT =
  "check:public-roadmap-honest-dates-p3-88" as const;

export const PUBLIC_ROADMAP_P3_88_UNIT_TEST =
  "tests/unit/public-roadmap-honest-dates-p3-88.test.ts" as const;

export const PUBLIC_ROADMAP_P3_88_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const PUBLIC_ROADMAP_P3_88_UPSTREAM_P3_69 = "docs/public-roadmap-p3-69.md" as const;

export const PUBLIC_ROADMAP_P3_88_UPSTREAM_P1_25 =
  "lib/marketing/remove-hardware-roadmap-p1-25-policy.ts" as const;

export const PUBLIC_ROADMAP_P3_88_CANONICAL_PATH = PUBLIC_ROADMAP_PATH;

/** Quarter labels must use explicit 2026 calendar quarters — no vague "soon". */
export const PUBLIC_ROADMAP_P3_88_REQUIRED_QUARTER_PATTERN = /^Q[1-4] 2026/;

/** Hardware keywords must not appear in dated quarter sections (P1-25 + P3-88). */
export const PUBLIC_ROADMAP_P3_88_HARDWARE_KEYWORDS = [
  "hardware",
  "terminal",
  "reader sdk",
  "native terminal",
  "proprietary device",
  "payment terminal",
  "label printer hardware",
] as const;

/** Banned undated promise phrases on /roadmap copy. */
export const PUBLIC_ROADMAP_P3_88_BANNED_UNDATED_PHRASES = [
  "coming soon",
  "roadmap-only",
  "TBA",
  "TBD",
  "to be announced",
  "later this year",
  "hardware coming soon",
] as const;

export const PUBLIC_ROADMAP_P3_88_CONFIDENCE_LEVELS = [
  "high",
  "medium",
  "conditional",
] as const;

export const PUBLIC_ROADMAP_P3_88_WIRING_PATHS = [
  PUBLIC_ROADMAP_P3_88_DOC,
  PUBLIC_ROADMAP_P3_88_ARTIFACT,
  PUBLIC_ROADMAP_P3_88_MEASUREMENT_MODULE,
  PUBLIC_ROADMAP_P3_88_AUDIT_MODULE,
  PUBLIC_ROADMAP_P3_88_UNIT_TEST,
  PUBLIC_ROADMAP_P3_88_CI_WORKFLOW,
  PUBLIC_ROADMAP_P3_88_UPSTREAM_P3_69,
  PUBLIC_ROADMAP_P3_88_UPSTREAM_P1_25,
  "lib/marketing/public-roadmap-content.ts",
  "components/marketing/public-roadmap-page.tsx",
  "app/roadmap/page.tsx",
] as const;
