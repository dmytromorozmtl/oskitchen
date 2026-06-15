/**
 * Sustained product evolution execution policy — Era 39 Step 11 orchestration layer.
 */
import { SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_POLICY_ID } from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";
import {
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_DOC,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_HTML_ARTIFACT,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_ORCHESTRATOR_COMMAND,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_STEP12_DOC,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/sustained-product-evolution-execution-orchestrator";

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_BACKLOG_ID =
  "KOS-E39-001-SUSTAINED-PRODUCT-EVOLUTION-EXECUTION" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_EXTENDS_POLICIES = [
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_POLICY_ID,
  "era23-sustained-product-evolution-post-improvement-loop-orchestrator-v1",
  "era35-sustained-product-evolution-integrity-v1",
  "commercial-inflection-readiness-v1",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_OPS_SCRIPTS = [
  "ops:run-sustained-product-evolution-execution",
  "ops:run-sustained-operational-excellence-execution",
  "ops:run-sustained-product-evolution-post-improvement-loop-orchestrator",
  "ops:validate-sustained-product-evolution",
  "ops:validate-sustained-product-evolution-integrity",
  "ops:validate-continuous-improvement-loop",
  "ops:validate-pure-operational-mode-terminus-era25",
  "smoke:pilot-metrics-baseline",
  "smoke:competitor-feature-gap-matrix",
  "smoke:pilot-forbidden-claims-enforcement",
  "ops:run-continuous-improvement-loop-execution",
  "ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_CI_SCRIPTS = [
  "test:ci:sustained-product-evolution-execution",
  "test:ci:sustained-product-evolution-execution:cert",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_UNIT_TESTS = [
  "tests/unit/sustained-product-evolution-execution-orchestrator.test.ts",
  "tests/unit/sustained-product-evolution-execution-cert-live.test.ts",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_CANONICAL_DOC_PATHS = [
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_DOC,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_STEP12_DOC,
  "docs/next-step-11-sustained-product-evolution-2026-05-28.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_PRODUCT_SURFACES = [
  "lib/commercial/sustained-product-evolution-ui-era23.ts",
  "lib/commercial/continuous-improvement-loop-ui-era22.ts",
  "components/dashboard/sustained-product-evolution-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;

export {
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_DOC,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_HTML_ARTIFACT,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_ORCHESTRATOR_COMMAND,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_STEP12_DOC,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_SUMMARY_ARTIFACT,
};
