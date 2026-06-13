/**
 * Blueprint P3-69 — Public roadmap page /roadmap.
 *
 * @see app/roadmap/page.tsx
 * @see docs/public-roadmap-p3-69.md
 */

import {
  PUBLIC_ROADMAP_META,
  PUBLIC_ROADMAP_PATH,
} from "@/lib/marketing/public-roadmap-content";

export const PUBLIC_ROADMAP_P3_69_POLICY_ID = "public-roadmap-p3-69-v1" as const;

export const PUBLIC_ROADMAP_P3_69_DOC = "docs/public-roadmap-p3-69.md" as const;

export const PUBLIC_ROADMAP_P3_69_ARTIFACT = "artifacts/public-roadmap-p3-69-registry.json" as const;

export const PUBLIC_ROADMAP_P3_69_AUDIT_SCRIPT =
  "scripts/audit-public-roadmap-p3-69.ts" as const;

export const PUBLIC_ROADMAP_P3_69_NPM_SCRIPT = "audit:public-roadmap-p3-69" as const;

export const PUBLIC_ROADMAP_P3_69_CHECK_NPM_SCRIPT = "check:public-roadmap-p3-69" as const;

export const PUBLIC_ROADMAP_P3_69_UNIT_TEST = "tests/unit/public-roadmap-p3-69.test.ts" as const;

export const PUBLIC_ROADMAP_P3_69_UPSTREAM_DOC = "docs/PRODUCT_ROADMAP_2026.md" as const;

export const PUBLIC_ROADMAP_P3_69_STRATEGIC_DOC = "docs/STRATEGIC_ROADMAP.md" as const;

export const PUBLIC_ROADMAP_P3_69_CANONICAL_PATH = PUBLIC_ROADMAP_PATH;

export const PUBLIC_ROADMAP_P3_69_PRIMARY_KEYWORD = "os kitchen roadmap" as const;

export const PUBLIC_ROADMAP_P3_69_NPM_SCRIPTS = [
  "test:ci:public-roadmap",
  "test:ci:public-roadmap:cert",
] as const;

export const PUBLIC_ROADMAP_P3_69_WIRING_PATHS = [
  PUBLIC_ROADMAP_P3_69_DOC,
  "app/roadmap/page.tsx",
  "components/marketing/public-roadmap-page.tsx",
  "lib/marketing/public-roadmap-content.ts",
  "lib/marketing/public-roadmap-audit.ts",
  "lib/marketing/public-roadmap-p3-69-measurement.ts",
  "lib/marketing/public-roadmap-p3-69-audit.ts",
  PUBLIC_ROADMAP_P3_69_UNIT_TEST,
  PUBLIC_ROADMAP_P3_69_ARTIFACT,
  PUBLIC_ROADMAP_P3_69_UPSTREAM_DOC,
  PUBLIC_ROADMAP_P3_69_STRATEGIC_DOC,
] as const;

export function publicRoadmapPathsAligned(): boolean {
  return (
    PUBLIC_ROADMAP_PATH === PUBLIC_ROADMAP_P3_69_CANONICAL_PATH &&
    PUBLIC_ROADMAP_META.utmCampaign === "public_roadmap_seo"
  );
}
