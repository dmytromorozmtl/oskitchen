/**
 * Series A partner expansion execution policy — Era 36 Step 8 orchestration layer.
 */
import { PRODUCTION_GA_EXECUTION_POLICY_ID } from "@/lib/ops/production-ga-execution-orchestrator";
import {
  SERIES_A_PARTNER_EXPANSION_EXECUTION_DOC,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_HTML_ARTIFACT,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_STEP9_DOC,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_BACKLOG_ID =
  "KOS-E36-001-SERIES-A-PARTNER-EXPANSION-EXECUTION" as const;

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_EXTENDS_POLICIES = [
  PRODUCTION_GA_EXECUTION_POLICY_ID,
  "era21-series-a-partner-expansion-post-scale-orchestrator-v1",
  "era31-series-a-partner-expansion-integrity-v1",
  "commercial-inflection-readiness-v1",
] as const;

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_OPS_SCRIPTS = [
  "ops:run-series-a-partner-expansion-execution",
  "ops:run-production-ga-execution",
  "ops:run-series-a-partner-expansion-post-scale-orchestrator",
  "ops:validate-series-a-partner-expansion-env",
  "ops:validate-series-a-partner-expansion-integrity",
  "smoke:investor-narrative-onepager",
  "smoke:competitor-feature-gap-matrix",
  "smoke:woo-shopify-live",
  "smoke:pilot-forbidden-claims-enforcement",
  "smoke:pilot-metrics-baseline",
  "ops:run-market-leader-positioning-post-series-a-orchestrator",
] as const;

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_CI_SCRIPTS = [
  "test:ci:series-a-partner-expansion-execution",
  "test:ci:series-a-partner-expansion-execution:cert",
] as const;

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_UNIT_TESTS = [
  "tests/unit/series-a-partner-expansion-execution-orchestrator.test.ts",
  "tests/unit/series-a-partner-expansion-execution-cert-live.test.ts",
] as const;

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_CANONICAL_DOC_PATHS = [
  SERIES_A_PARTNER_EXPANSION_EXECUTION_DOC,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_STEP9_DOC,
  "docs/next-step-7-series-a-partner-expansion-2026-05-28.md",
  "docs/competitor-leapfrog-roadmap-2026-05-28.md",
] as const;

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/series-a-partner-expansion-ui-era21.ts",
  "lib/commercial/market-leader-positioning-ui-era21.ts",
  "components/dashboard/series-a-partner-expansion-phases-panel.tsx",
  "components/dashboard/market-leader-positioning-phases-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  SERIES_A_PARTNER_EXPANSION_EXECUTION_DOC,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_HTML_ARTIFACT,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_STEP9_DOC,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_SUMMARY_ARTIFACT,
};
