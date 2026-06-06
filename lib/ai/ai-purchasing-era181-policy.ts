/**
 * Era 181 — AI Purchasing Manager wiring cert (Phase 4 Round 2 #33).
 *
 * Full path: demand + suppliers → shortage prediction → price optimization → daily brief → dashboard.
 */

import {
  AI_PURCHASING_ERA106_CAPABILITIES,
  AI_PURCHASING_ERA106_OPS_DOC,
  AI_PURCHASING_ERA106_POLICY_ID,
  AI_PURCHASING_ERA106_ROUTE,
  AI_PURCHASING_ERA106_SERVICE,
  AI_PURCHASING_ERA106_SUMMARY_ARTIFACT,
  AI_PURCHASING_ERA106_WIRING_PATHS,
} from "@/lib/ai/ai-purchasing-era106-policy";

export const AI_PURCHASING_ERA181_POLICY_ID = "era181-ai-purchasing-manager-v1" as const;

export const AI_PURCHASING_ERA181_SUMMARY_ARTIFACT =
  "artifacts/ai-purchasing-era181-smoke-summary.json" as const;

export const AI_PURCHASING_ERA181_NPM_SCRIPT = "smoke:ai-purchasing-era181" as const;

export const AI_PURCHASING_ERA181_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-ai-purchasing-era181.ts" as const;

export const AI_PURCHASING_ERA181_OPS_DOC = "docs/ai-purchasing-era181-setup.md" as const;

export const AI_PURCHASING_ERA181_CANONICAL_OPS_DOC = AI_PURCHASING_ERA106_OPS_DOC;

export const AI_PURCHASING_ERA181_CANONICAL_SUMMARY_ARTIFACT =
  AI_PURCHASING_ERA106_SUMMARY_ARTIFACT;

export const AI_PURCHASING_ERA181_WIRING_PATHS = AI_PURCHASING_ERA106_WIRING_PATHS;

export const AI_PURCHASING_ERA181_SERVICE = AI_PURCHASING_ERA106_SERVICE;

export const AI_PURCHASING_ERA181_ROUTE = AI_PURCHASING_ERA106_ROUTE;

export const AI_PURCHASING_ERA181_CAPABILITIES = AI_PURCHASING_ERA106_CAPABILITIES;

export const AI_PURCHASING_ERA181_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Inventory → AI Purchasing.",
  "Verify daily purchasing brief with shortage signals and price switch count.",
  "Review recommendations — confirm alternative supplier savings and EOQ quantities.",
  "Order one item or Order All — draft PO created in Purchasing.",
  "Run npm run smoke:ai-purchasing-era106 — canonical era106 wiring cert PASSED.",
  "Run npm run smoke:ai-purchasing-era181 — artifact overall PASSED.",
] as const;

export const AI_PURCHASING_ERA181_CI_SCRIPTS = [
  "test:ci:ai-purchasing-era181",
  "test:ci:ai-purchasing-era181:cert",
] as const;

export const AI_PURCHASING_ERA181_UNIT_TESTS = [
  "tests/unit/ai-purchasing-era181.test.ts",
  "tests/unit/ai-purchasing-era106.test.ts",
  "tests/unit/ai-purchasing-builders.test.ts",
] as const;

export const AI_PURCHASING_ERA181_CANONICAL_POLICY_ID = AI_PURCHASING_ERA106_POLICY_ID;
