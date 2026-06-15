/**
 * Era 183 — AI Food Cost Manager wiring cert (Phase 4 Round 2 #35).
 *
 * Full path: costing + recipes → per-item profit → real-time margin → price recommendations → dashboard.
 */

import {
  AI_FOOD_COST_MANAGER_ERA108_CAPABILITIES,
  AI_FOOD_COST_MANAGER_ERA108_OPS_DOC,
  AI_FOOD_COST_MANAGER_ERA108_POLICY_ID,
  AI_FOOD_COST_MANAGER_ERA108_ROUTE,
  AI_FOOD_COST_MANAGER_ERA108_SERVICE,
  AI_FOOD_COST_MANAGER_ERA108_SUMMARY_ARTIFACT,
  AI_FOOD_COST_MANAGER_ERA108_WIRING_PATHS,
} from "@/lib/ai/food-cost-manager-era108-policy";

export const AI_FOOD_COST_MANAGER_ERA183_POLICY_ID = "era183-ai-food-cost-manager-v1" as const;

export const AI_FOOD_COST_MANAGER_ERA183_SUMMARY_ARTIFACT =
  "artifacts/ai-food-cost-manager-era183-smoke-summary.json" as const;

export const AI_FOOD_COST_MANAGER_ERA183_NPM_SCRIPT = "smoke:ai-food-cost-manager-era183" as const;

export const AI_FOOD_COST_MANAGER_ERA183_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-ai-food-cost-manager-era183.ts" as const;

export const AI_FOOD_COST_MANAGER_ERA183_OPS_DOC = "docs/ai-food-cost-manager-era183-setup.md" as const;

export const AI_FOOD_COST_MANAGER_ERA183_CANONICAL_OPS_DOC = AI_FOOD_COST_MANAGER_ERA108_OPS_DOC;

export const AI_FOOD_COST_MANAGER_ERA183_CANONICAL_SUMMARY_ARTIFACT =
  AI_FOOD_COST_MANAGER_ERA108_SUMMARY_ARTIFACT;

export const AI_FOOD_COST_MANAGER_ERA183_WIRING_PATHS = AI_FOOD_COST_MANAGER_ERA108_WIRING_PATHS;

export const AI_FOOD_COST_MANAGER_ERA183_SERVICE = AI_FOOD_COST_MANAGER_ERA108_SERVICE;

export const AI_FOOD_COST_MANAGER_ERA183_ROUTE = AI_FOOD_COST_MANAGER_ERA108_ROUTE;

export const AI_FOOD_COST_MANAGER_ERA183_CAPABILITIES = AI_FOOD_COST_MANAGER_ERA108_CAPABILITIES;

export const AI_FOOD_COST_MANAGER_ERA183_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Analytics → Food Cost.",
  "Verify daily food cost brief with price bump count and avg profit per item.",
  "Review per-item table — real-time margin % and profit per item columns.",
  "Expand item drill-down — confirm price recommendation and expected margin.",
  "Run npm run smoke:ai-food-cost-manager-era108 — canonical era108 wiring cert PASSED.",
  "Run npm run smoke:ai-food-cost-manager-era183 — artifact overall PASSED.",
] as const;

export const AI_FOOD_COST_MANAGER_ERA183_CI_SCRIPTS = [
  "test:ci:ai-food-cost-manager-era183",
  "test:ci:ai-food-cost-manager-era183:cert",
] as const;

export const AI_FOOD_COST_MANAGER_ERA183_UNIT_TESTS = [
  "tests/unit/ai-food-cost-manager-era183.test.ts",
  "tests/unit/ai-food-cost-manager-era108.test.ts",
  "tests/unit/food-cost-builders.test.ts",
] as const;

export const AI_FOOD_COST_MANAGER_ERA183_CANONICAL_POLICY_ID = AI_FOOD_COST_MANAGER_ERA108_POLICY_ID;
