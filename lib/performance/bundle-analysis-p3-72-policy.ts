/**
 * Blueprint P3-72 — Bundle analysis optimization (heavy chunk code-split wave 2).
 *
 * @see docs/bundle-analysis.md
 * @see docs/bundle-analysis-p3-72.md
 */

import {
  BUNDLE_ANALYSIS_CODE_SPLIT_TARGETS,
  BUNDLE_ANALYSIS_LAZY_PANELS,
  BUNDLE_ANALYSIS_POLICY_ID,
  BUNDLE_ANALYSIS_TOP_HEAVY_PACKAGES,
  BUNDLE_ANALYSIS_UNIT_TEST,
} from "@/lib/performance/bundle-analysis-policy";

export const BUNDLE_ANALYSIS_P3_72_POLICY_ID = "bundle-analysis-p3-72-v1" as const;

export const BUNDLE_ANALYSIS_P3_72_DOC = "docs/bundle-analysis-p3-72.md" as const;

export const BUNDLE_ANALYSIS_P3_72_ARTIFACT =
  "artifacts/bundle-analysis-p3-72-registry.json" as const;

export const BUNDLE_ANALYSIS_P3_72_AUDIT_SCRIPT =
  "scripts/audit-bundle-analysis-p3-72.ts" as const;

export const BUNDLE_ANALYSIS_P3_72_NPM_SCRIPT = "audit:bundle-analysis-p3-72" as const;

export const BUNDLE_ANALYSIS_P3_72_CHECK_NPM_SCRIPT = "check:bundle-analysis-p3-72" as const;

export const BUNDLE_ANALYSIS_P3_72_UNIT_TEST =
  "tests/unit/bundle-analysis-p3-72.test.ts" as const;

export const BUNDLE_ANALYSIS_P3_72_UPSTREAM_POLICY_ID = BUNDLE_ANALYSIS_POLICY_ID;

export const BUNDLE_ANALYSIS_P3_72_UPSTREAM_DOC = "docs/bundle-analysis.md" as const;

export const BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT = 3 as const;

export const BUNDLE_ANALYSIS_P3_72_WAVE_2_TARGETS = [
  {
    id: "partner-operations",
    lazyExport: "LazyPartnerOperationsCenter",
    routeFile: "app/dashboard/partner/page.tsx",
    heavyPackage: "recharts",
  },
  {
    id: "growth-command-center",
    lazyExport: "LazyGrowthCommandCenter",
    routeFile: "app/dashboard/growth/page.tsx",
    heavyPackage: "recharts",
  },
  {
    id: "vendor-analytics",
    lazyExport: "LazyVendorAnalyticsClient",
    routeFile: "app/vendor/(cabinet)/analytics/page.tsx",
    heavyPackage: "recharts",
  },
] as const;

export const BUNDLE_ANALYSIS_P3_72_NPM_SCRIPTS = [
  "test:ci:bundle-analysis",
  "test:ci:bundle-analysis-p3-72:cert",
  "audit:bundle-chunks",
] as const;

export const BUNDLE_ANALYSIS_P3_72_WIRING_PATHS = [
  BUNDLE_ANALYSIS_P3_72_DOC,
  BUNDLE_ANALYSIS_P3_72_UPSTREAM_DOC,
  BUNDLE_ANALYSIS_LAZY_PANELS,
  "lib/performance/bundle-chunk-audit.ts",
  "lib/performance/bundle-analysis-p3-72-measurement.ts",
  "lib/performance/bundle-analysis-p3-72-audit.ts",
  "scripts/audit-bundle-chunks.ts",
  BUNDLE_ANALYSIS_P3_72_UNIT_TEST,
  BUNDLE_ANALYSIS_UNIT_TEST,
  BUNDLE_ANALYSIS_P3_72_ARTIFACT,
  "next.config.ts",
  ...BUNDLE_ANALYSIS_P3_72_WAVE_2_TARGETS.map((t) => t.routeFile),
] as const;

export const BUNDLE_ANALYSIS_P3_72_TOTAL_CODE_SPLIT_TARGETS =
  BUNDLE_ANALYSIS_CODE_SPLIT_TARGETS.length + BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT;

export const BUNDLE_ANALYSIS_P3_72_HEAVY_PACKAGES = BUNDLE_ANALYSIS_TOP_HEAVY_PACKAGES;
