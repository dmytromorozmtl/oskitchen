/**
 * Sustained product evolution — Era 23 Step 11 product + CLI wiring (post-era22).
 */

import { SUSTAINED_PRODUCT_EVOLUTION_PHASES_ERA23_POLICY_ID } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import { SUSTAINED_PRODUCT_EVOLUTION_UI_ERA23_POLICY_ID } from "@/lib/commercial/sustained-product-evolution-ui-era23";

export const SUSTAINED_PRODUCT_EVOLUTION_ERA23_POLICY_ID =
  "era23-sustained-product-evolution-v1" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_ERA23_BACKLOG_ID = "KOS-E23-011" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_ERA23_EXTENDS_POLICIES = [
  "era22-continuous-improvement-loop-v1",
  "era25-pure-operational-mode-terminus-v1",
  SUSTAINED_PRODUCT_EVOLUTION_PHASES_ERA23_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_UI_ERA23_POLICY_ID,
  "era23-sustained-product-evolution-post-improvement-loop-orchestrator-v1",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_ERA23_OPS_SCRIPTS = [
  "ops:run-sustained-product-evolution-execution",
  "ops:run-sustained-operational-excellence-execution",
  "ops:run-sustained-product-evolution-post-improvement-loop-orchestrator",
  "ops:validate-sustained-product-evolution",
  "ops:sync-sustained-product-evolution-progress-report",
  "ops:export-sustained-product-evolution-ownership-matrix",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_ERA23_CI_SCRIPTS = [
  "test:ci:sustained-product-evolution-execution",
  "test:ci:sustained-product-evolution-execution:cert",
  "test:ci:sustained-product-evolution-era23",
  "test:ci:sustained-product-evolution-era23:cert",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_ERA23_UNIT_TESTS = [
  "tests/unit/sustained-product-evolution-execution-orchestrator.test.ts",
  "tests/unit/sustained-product-evolution-execution-cert-live.test.ts",
  "tests/unit/sustained-product-evolution-post-improvement-loop-orchestrator-era23.test.ts",
  "tests/unit/sustained-product-evolution-phases-era23.test.ts",
  "tests/unit/sustained-product-evolution-ui-era23.test.ts",
  "tests/unit/run-sustained-product-evolution-post-improvement-loop-orchestrator.test.ts",
  "tests/unit/validate-sustained-product-evolution.test.ts",
  "tests/unit/sustained-product-evolution-era23-cert-live.test.ts",
  "tests/unit/sustained-product-evolution-era25-integration.test.ts",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_ERA23_PRODUCT_SURFACES = [
  "components/dashboard/sustained-product-evolution-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
