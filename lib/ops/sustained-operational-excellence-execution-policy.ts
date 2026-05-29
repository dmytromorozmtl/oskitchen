/**
 * Sustained operational excellence execution policy — Era 38 Step 10 orchestration layer.
 */
import { MARKET_LEADER_POSITIONING_EXECUTION_POLICY_ID } from "@/lib/ops/market-leader-positioning-execution-orchestrator";
import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_DOC,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_HTML_ARTIFACT,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_ORCHESTRATOR_COMMAND,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_STEP11_DOC,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_BACKLOG_ID =
  "KOS-E38-001-SUSTAINED-OPERATIONAL-EXCELLENCE-EXECUTION" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_EXTENDS_POLICIES = [
  MARKET_LEADER_POSITIONING_EXECUTION_POLICY_ID,
  "era21-sustained-operational-excellence-post-market-leader-orchestrator-v1",
  "era33-sustained-operational-excellence-integrity-v1",
  "commercial-inflection-readiness-v1",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_OPS_SCRIPTS = [
  "ops:run-sustained-operational-excellence-execution",
  "ops:run-market-leader-positioning-execution",
  "ops:run-sustained-operational-excellence-post-market-leader-orchestrator",
  "ops:validate-sustained-operational-excellence-env",
  "ops:validate-sustained-operational-excellence-integrity",
  "smoke:woo-shopify-live",
  "smoke:commerce-webhook-drill",
  "smoke:pilot-metrics-baseline",
  "smoke:pilot-forbidden-claims-enforcement",
  "smoke:competitor-feature-gap-matrix",
  "smoke:pilot-gono-go",
  "ops:run-sustained-product-evolution-post-improvement-loop-orchestrator",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_CI_SCRIPTS = [
  "test:ci:sustained-operational-excellence-execution",
  "test:ci:sustained-operational-excellence-execution:cert",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_UNIT_TESTS = [
  "tests/unit/sustained-operational-excellence-execution-orchestrator.test.ts",
  "tests/unit/sustained-operational-excellence-execution-cert-live.test.ts",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_CANONICAL_DOC_PATHS = [
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_DOC,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_STEP11_DOC,
  "docs/next-step-9-sustained-operational-excellence-2026-05-28.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/sustained-operational-excellence-ui-era21.ts",
  "lib/commercial/sustained-product-evolution-ui-era23.ts",
  "components/dashboard/sustained-operational-excellence-phases-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_DOC,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_HTML_ARTIFACT,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_ORCHESTRATOR_COMMAND,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_STEP11_DOC,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_SUMMARY_ARTIFACT,
};
