/**
 * Market leader positioning execution policy — Era 37 Step 9 orchestration layer.
 */
import { SERIES_A_PARTNER_EXPANSION_EXECUTION_POLICY_ID } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";
import {
  MARKET_LEADER_POSITIONING_EXECUTION_DOC,
  MARKET_LEADER_POSITIONING_EXECUTION_HTML_ARTIFACT,
  MARKET_LEADER_POSITIONING_EXECUTION_ORCHESTRATOR_COMMAND,
  MARKET_LEADER_POSITIONING_EXECUTION_POLICY_ID,
  MARKET_LEADER_POSITIONING_EXECUTION_STEP10_DOC,
  MARKET_LEADER_POSITIONING_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/market-leader-positioning-execution-orchestrator";

export const MARKET_LEADER_POSITIONING_EXECUTION_BACKLOG_ID =
  "KOS-E37-001-MARKET-LEADER-POSITIONING-EXECUTION" as const;

export const MARKET_LEADER_POSITIONING_EXECUTION_EXTENDS_POLICIES = [
  SERIES_A_PARTNER_EXPANSION_EXECUTION_POLICY_ID,
  "era21-market-leader-positioning-post-series-a-orchestrator-v1",
  "era32-market-leader-positioning-integrity-v1",
  "commercial-inflection-readiness-v1",
] as const;

export const MARKET_LEADER_POSITIONING_EXECUTION_OPS_SCRIPTS = [
  "ops:run-market-leader-positioning-execution",
  "ops:run-series-a-partner-expansion-execution",
  "ops:run-market-leader-positioning-post-series-a-orchestrator",
  "ops:validate-market-leader-positioning-env",
  "ops:validate-market-leader-positioning-integrity",
  "smoke:pilot-case-study-draft",
  "smoke:pilot-rollback-drill",
  "smoke:commerce-webhook-drill",
  "smoke:pilot-forbidden-claims-enforcement",
  "smoke:investor-narrative-onepager",
  "smoke:pilot-metrics-baseline",
  "ops:run-sustained-operational-excellence-post-market-leader-orchestrator",
] as const;

export const MARKET_LEADER_POSITIONING_EXECUTION_CI_SCRIPTS = [
  "test:ci:market-leader-positioning-execution",
  "test:ci:market-leader-positioning-execution:cert",
] as const;

export const MARKET_LEADER_POSITIONING_EXECUTION_UNIT_TESTS = [
  "tests/unit/market-leader-positioning-execution-orchestrator.test.ts",
  "tests/unit/market-leader-positioning-execution-cert-live.test.ts",
] as const;

export const MARKET_LEADER_POSITIONING_EXECUTION_CANONICAL_DOC_PATHS = [
  MARKET_LEADER_POSITIONING_EXECUTION_DOC,
  MARKET_LEADER_POSITIONING_EXECUTION_STEP10_DOC,
  "docs/next-step-8-market-leader-positioning-2026-05-28.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const MARKET_LEADER_POSITIONING_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/market-leader-positioning-ui-era21.ts",
  "lib/commercial/sustained-operational-excellence-ui-era21.ts",
  "components/dashboard/market-leader-positioning-phases-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  MARKET_LEADER_POSITIONING_EXECUTION_DOC,
  MARKET_LEADER_POSITIONING_EXECUTION_HTML_ARTIFACT,
  MARKET_LEADER_POSITIONING_EXECUTION_ORCHESTRATOR_COMMAND,
  MARKET_LEADER_POSITIONING_EXECUTION_POLICY_ID,
  MARKET_LEADER_POSITIONING_EXECUTION_STEP10_DOC,
  MARKET_LEADER_POSITIONING_EXECUTION_SUMMARY_ARTIFACT,
};
