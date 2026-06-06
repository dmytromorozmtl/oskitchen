/**
 * Era 110 — AI Marketing Manager wiring cert (Phase 4 extension #110).
 *
 * Full path: order/churn/cart signals → auto campaigns → weather promos → dashboard.
 */

import { AI_MARKETING_MANAGER_POLICY_ID } from "@/lib/ai/marketing-manager-policy";

export const AI_MARKETING_MANAGER_ERA110_POLICY_ID = "era110-ai-marketing-manager-v1" as const;

export const AI_MARKETING_MANAGER_ERA110_SUMMARY_ARTIFACT =
  "artifacts/ai-marketing-manager-smoke-summary.json" as const;

export const AI_MARKETING_MANAGER_ERA110_NPM_SCRIPT = "smoke:ai-marketing-manager-era110" as const;

export const AI_MARKETING_MANAGER_ERA110_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-ai-marketing-manager-era110.ts" as const;

export const AI_MARKETING_MANAGER_ERA110_OPS_DOC = "docs/ai-marketing-manager-era110-setup.md" as const;

export const AI_MARKETING_MANAGER_ERA110_WIRING_PATHS = [
  "services/ai/marketing-manager.ts",
  "lib/ai/marketing-manager-builders.ts",
  "lib/ai/marketing-manager-policy.ts",
  "app/dashboard/marketing/manager/page.tsx",
  "components/marketing/marketing-manager-client.tsx",
] as const;

export const AI_MARKETING_MANAGER_ERA110_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Marketing → AI Marketing Manager.",
  "Verify daily marketing brief with weather mode and campaign summary.",
  "Review auto campaigns — win-back, abandoned cart, welcome flows.",
  "Check weather & calendar promos — rain, heat, holiday suggestions.",
  "Run npm run smoke:ai-marketing-manager-era110 — artifact overall PASSED.",
] as const;

export const AI_MARKETING_MANAGER_ERA110_CI_SCRIPTS = [
  "test:ci:ai-marketing-manager-era110",
  "test:ci:ai-marketing-manager-era110:cert",
] as const;

export const AI_MARKETING_MANAGER_ERA110_UNIT_TESTS = [
  "tests/unit/ai-marketing-manager-era110.test.ts",
  "tests/unit/marketing-manager.test.ts",
] as const;

export const AI_MARKETING_MANAGER_ERA110_CANONICAL_POLICY_ID = AI_MARKETING_MANAGER_POLICY_ID;

export const AI_MARKETING_MANAGER_ERA110_SERVICE = "services/ai/marketing-manager.ts" as const;

export const AI_MARKETING_MANAGER_ERA110_ROUTE = "/dashboard/marketing/manager" as const;

export const AI_MARKETING_MANAGER_ERA110_CAPABILITIES = [
  "auto_campaigns",
  "weather_promos",
  "daily_brief",
] as const;
