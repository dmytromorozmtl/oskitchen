/**
 * Era 185 — AI Marketing Manager wiring cert (Phase 4 Round 2 #37).
 *
 * Full path: order/churn/cart signals → auto campaigns → weather promos → dashboard.
 */

import {
  AI_MARKETING_MANAGER_ERA110_CAPABILITIES,
  AI_MARKETING_MANAGER_ERA110_OPS_DOC,
  AI_MARKETING_MANAGER_ERA110_POLICY_ID,
  AI_MARKETING_MANAGER_ERA110_ROUTE,
  AI_MARKETING_MANAGER_ERA110_SERVICE,
  AI_MARKETING_MANAGER_ERA110_SUMMARY_ARTIFACT,
  AI_MARKETING_MANAGER_ERA110_WIRING_PATHS,
} from "@/lib/ai/marketing-manager-era110-policy";

export const AI_MARKETING_MANAGER_ERA185_POLICY_ID = "era185-ai-marketing-manager-v1" as const;

export const AI_MARKETING_MANAGER_ERA185_SUMMARY_ARTIFACT =
  "artifacts/ai-marketing-manager-era185-smoke-summary.json" as const;

export const AI_MARKETING_MANAGER_ERA185_NPM_SCRIPT = "smoke:ai-marketing-manager-era185" as const;

export const AI_MARKETING_MANAGER_ERA185_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-ai-marketing-manager-era185.ts" as const;

export const AI_MARKETING_MANAGER_ERA185_OPS_DOC = "docs/ai-marketing-manager-era185-setup.md" as const;

export const AI_MARKETING_MANAGER_ERA185_CANONICAL_OPS_DOC = AI_MARKETING_MANAGER_ERA110_OPS_DOC;

export const AI_MARKETING_MANAGER_ERA185_CANONICAL_SUMMARY_ARTIFACT =
  AI_MARKETING_MANAGER_ERA110_SUMMARY_ARTIFACT;

export const AI_MARKETING_MANAGER_ERA185_WIRING_PATHS = AI_MARKETING_MANAGER_ERA110_WIRING_PATHS;

export const AI_MARKETING_MANAGER_ERA185_SERVICE = AI_MARKETING_MANAGER_ERA110_SERVICE;

export const AI_MARKETING_MANAGER_ERA185_ROUTE = AI_MARKETING_MANAGER_ERA110_ROUTE;

export const AI_MARKETING_MANAGER_ERA185_CAPABILITIES = AI_MARKETING_MANAGER_ERA110_CAPABILITIES;

export const AI_MARKETING_MANAGER_ERA185_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Marketing → AI Marketing Manager.",
  "Verify daily marketing brief with weather mode and campaign summary.",
  "Review auto campaigns — win-back, abandoned cart, welcome flows.",
  "Check weather & calendar promos — rain, heat, holiday suggestions.",
  "Run npm run smoke:ai-marketing-manager-era110 — canonical era110 wiring cert PASSED.",
  "Run npm run smoke:ai-marketing-manager-era185 — artifact overall PASSED.",
] as const;

export const AI_MARKETING_MANAGER_ERA185_CI_SCRIPTS = [
  "test:ci:ai-marketing-manager-era185",
  "test:ci:ai-marketing-manager-era185:cert",
] as const;

export const AI_MARKETING_MANAGER_ERA185_UNIT_TESTS = [
  "tests/unit/ai-marketing-manager-era185.test.ts",
  "tests/unit/ai-marketing-manager-era110.test.ts",
  "tests/unit/marketing-manager.test.ts",
] as const;

export const AI_MARKETING_MANAGER_ERA185_CANONICAL_POLICY_ID = AI_MARKETING_MANAGER_ERA110_POLICY_ID;
