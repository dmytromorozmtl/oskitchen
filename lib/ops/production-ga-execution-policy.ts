/**
 * Production GA execution policy — Era 35 Step 7 orchestration layer.
 */
import { PILOT_SCALE_EXPANSION_EXECUTION_POLICY_ID } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import {
  PRODUCTION_GA_EXECUTION_DOC,
  PRODUCTION_GA_EXECUTION_HTML_ARTIFACT,
  PRODUCTION_GA_EXECUTION_ORCHESTRATOR_COMMAND,
  PRODUCTION_GA_EXECUTION_POLICY_ID,
  PRODUCTION_GA_EXECUTION_STEP8_DOC,
  PRODUCTION_GA_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/production-ga-execution-orchestrator";

export const PRODUCTION_GA_EXECUTION_BACKLOG_ID = "KOS-E35-001-PRODUCTION-GA-EXECUTION" as const;

export const PRODUCTION_GA_EXECUTION_EXTENDS_POLICIES = [
  PILOT_SCALE_EXPANSION_EXECUTION_POLICY_ID,
  "era30-scale-readiness-integrity-v1",
  "commercial-inflection-readiness-v1",
  "era17-pilot-forbidden-claims-enforcement-v1",
] as const;

export const PRODUCTION_GA_EXECUTION_OPS_SCRIPTS = [
  "ops:run-production-ga-execution",
  "ops:run-pilot-scale-expansion-execution",
  "run:production-pilot-ready",
  "ops:validate-scale-readiness-integrity",
  "smoke:pilot-forbidden-claims-enforcement",
  "smoke:investor-narrative-onepager",
  "smoke:pilot-rollback-drill",
  "test:ci:cron-hygiene",
  "test:security",
  "ops:run-commercial-inflection-readiness-orchestrator",
  "ops:run-series-a-partner-expansion-execution",
] as const;

export const PRODUCTION_GA_EXECUTION_CI_SCRIPTS = [
  "test:ci:production-ga-execution",
  "test:ci:production-ga-execution:cert",
] as const;

export const PRODUCTION_GA_EXECUTION_UNIT_TESTS = [
  "tests/unit/production-ga-execution-orchestrator.test.ts",
  "tests/unit/production-ga-execution-cert-live.test.ts",
] as const;

export const PRODUCTION_GA_EXECUTION_CANONICAL_DOC_PATHS = [
  PRODUCTION_GA_EXECUTION_DOC,
  PRODUCTION_GA_EXECUTION_STEP8_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/sales-forbidden-claims-training-era20.md",
] as const;

export const PRODUCTION_GA_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/series-a-partner-expansion-ui-era21.ts",
  "components/dashboard/series-a-partner-expansion-phases-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  PRODUCTION_GA_EXECUTION_DOC,
  PRODUCTION_GA_EXECUTION_HTML_ARTIFACT,
  PRODUCTION_GA_EXECUTION_ORCHESTRATOR_COMMAND,
  PRODUCTION_GA_EXECUTION_POLICY_ID,
  PRODUCTION_GA_EXECUTION_STEP8_DOC,
  PRODUCTION_GA_EXECUTION_SUMMARY_ARTIFACT,
};
