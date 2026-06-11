/**
 * P1-39 — bundle analysis: ANALYZE=true build, top-5 heavy chunks, code-splitting.
 */

export const BUNDLE_ANALYSIS_POLICY_ID = "bundle-analysis-p1-39-v1" as const;

export const BUNDLE_ANALYSIS_NPM_SCRIPT = "analyze" as const;

export const BUNDLE_ANALYSIS_REPORT_SCRIPT = "report:bundle" as const;

export const BUNDLE_ANALYSIS_CHUNK_AUDIT_SCRIPT = "scripts/audit-bundle-chunks.ts" as const;

export const BUNDLE_ANALYSIS_CHUNK_NPM_SCRIPT = "audit:bundle-chunks" as const;

export const BUNDLE_ANALYSIS_UNIT_TEST = "tests/unit/bundle-analysis.test.ts" as const;

export const BUNDLE_ANALYSIS_LAZY_PANELS = "components/charts/lazy-chart-panels.tsx" as const;

export const BUNDLE_ANALYSIS_REPORT_ARTIFACT = "artifacts/bundle-analysis-report.json" as const;

export const BUNDLE_ANALYSIS_TOP_CHUNK_COUNT = 5 as const;

/** Known heavy client packages — treemap targets from @next/bundle-analyzer sweeps. */
export const BUNDLE_ANALYSIS_TOP_HEAVY_PACKAGES = [
  "recharts",
  "jspdf",
  "@sentry/nextjs",
  "@supabase/supabase-js",
  "lucide-react",
] as const;

/** Routes/components code-split in P1-39 to shrink First Load JS. */
export const BUNDLE_ANALYSIS_CODE_SPLIT_TARGETS = [
  {
    id: "benchmark-dashboard",
    lazyExport: "LazyBenchmarkDashboard",
    routeFile: "app/dashboard/analytics/benchmarks/page.tsx",
    heavyPackage: "recharts",
  },
  {
    id: "food-cost-dashboard",
    lazyExport: "LazyFoodCostDashboard",
    routeFile: "app/dashboard/analytics/food-cost/page.tsx",
    heavyPackage: "recharts",
  },
  {
    id: "marketplace-analytics",
    lazyExport: "LazyMarketplaceAnalyticsClient",
    routeFile: "app/dashboard/marketplace/analytics/page.tsx",
    heavyPackage: "recharts",
  },
  {
    id: "vendor-finance",
    lazyExport: "LazyVendorFinanceClient",
    routeFile: "app/vendor/(cabinet)/finance/page.tsx",
    heavyPackage: "recharts",
  },
  {
    id: "overview-charts",
    lazyExport: "LazyOverviewCharts",
    routeFile: "components/dashboard/home-overview.tsx",
    heavyPackage: "recharts",
  },
] as const;

export const BUNDLE_ANALYSIS_CI_SCRIPTS = [
  "test:ci:bundle-analysis",
  BUNDLE_ANALYSIS_CHUNK_NPM_SCRIPT,
  BUNDLE_ANALYSIS_REPORT_SCRIPT,
] as const;

export const BUNDLE_ANALYSIS_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;
