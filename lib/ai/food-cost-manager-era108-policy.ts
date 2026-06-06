/**
 * Era 108 — AI Food Cost Manager wiring cert (Phase 4 extension #108).
 *
 * Full path: costing + recipes → per-item profit → real-time margin → price recommendations → dashboard.
 */

import { AI_FOOD_COST_MANAGER_POLICY_ID } from "@/lib/ai/food-cost-manager-policy";

export const AI_FOOD_COST_MANAGER_ERA108_POLICY_ID = "era108-ai-food-cost-manager-v1" as const;

export const AI_FOOD_COST_MANAGER_ERA108_SUMMARY_ARTIFACT =
  "artifacts/ai-food-cost-manager-smoke-summary.json" as const;

export const AI_FOOD_COST_MANAGER_ERA108_NPM_SCRIPT = "smoke:ai-food-cost-manager-era108" as const;

export const AI_FOOD_COST_MANAGER_ERA108_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-ai-food-cost-manager-era108.ts" as const;

export const AI_FOOD_COST_MANAGER_ERA108_OPS_DOC = "docs/ai-food-cost-manager-era108-setup.md" as const;

export const AI_FOOD_COST_MANAGER_ERA108_WIRING_PATHS = [
  "services/ai/food-cost-ai.ts",
  "lib/ai/food-cost-builders.ts",
  "lib/ai/food-cost-manager-policy.ts",
  "services/ai/food-cost-dashboard.ts",
  "app/dashboard/analytics/food-cost/page.tsx",
  "components/dashboard/food-cost-dashboard.tsx",
] as const;

export const AI_FOOD_COST_MANAGER_ERA108_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Analytics → Food Cost.",
  "Verify daily food cost brief with price bump count and avg profit per item.",
  "Review per-item table — real-time margin % and profit per item columns.",
  "Expand item drill-down — confirm price recommendation and expected margin.",
  "Run npm run smoke:ai-food-cost-manager-era108 — artifact overall PASSED.",
] as const;

export const AI_FOOD_COST_MANAGER_ERA108_CI_SCRIPTS = [
  "test:ci:ai-food-cost-manager-era108",
  "test:ci:ai-food-cost-manager-era108:cert",
] as const;

export const AI_FOOD_COST_MANAGER_ERA108_UNIT_TESTS = [
  "tests/unit/ai-food-cost-manager-era108.test.ts",
  "tests/unit/food-cost-builders.test.ts",
] as const;

export const AI_FOOD_COST_MANAGER_ERA108_CANONICAL_POLICY_ID = AI_FOOD_COST_MANAGER_POLICY_ID;

export const AI_FOOD_COST_MANAGER_ERA108_SERVICE = "services/ai/food-cost-ai.ts" as const;

export const AI_FOOD_COST_MANAGER_ERA108_ROUTE = "/dashboard/analytics/food-cost" as const;

export const AI_FOOD_COST_MANAGER_ERA108_CAPABILITIES = [
  "real_time_margin",
  "per_item_profit",
  "price_recommendations",
  "daily_brief",
] as const;
