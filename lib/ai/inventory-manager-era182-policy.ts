/**
 * Era 182 — AI Inventory Manager wiring cert (Phase 4 Round 2 #34).
 *
 * Full path: waste events + theft alerts + count variance → signals → daily brief → dashboard.
 */

import {
  AI_INVENTORY_MANAGER_ERA107_CAPABILITIES,
  AI_INVENTORY_MANAGER_ERA107_OPS_DOC,
  AI_INVENTORY_MANAGER_ERA107_POLICY_ID,
  AI_INVENTORY_MANAGER_ERA107_ROUTE,
  AI_INVENTORY_MANAGER_ERA107_SERVICE,
  AI_INVENTORY_MANAGER_ERA107_SUMMARY_ARTIFACT,
  AI_INVENTORY_MANAGER_ERA107_WIRING_PATHS,
} from "@/lib/ai/inventory-manager-era107-policy";

export const AI_INVENTORY_MANAGER_ERA182_POLICY_ID = "era182-ai-inventory-manager-v1" as const;

export const AI_INVENTORY_MANAGER_ERA182_SUMMARY_ARTIFACT =
  "artifacts/ai-inventory-manager-era182-smoke-summary.json" as const;

export const AI_INVENTORY_MANAGER_ERA182_NPM_SCRIPT = "smoke:ai-inventory-manager-era182" as const;

export const AI_INVENTORY_MANAGER_ERA182_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-ai-inventory-manager-era182.ts" as const;

export const AI_INVENTORY_MANAGER_ERA182_OPS_DOC = "docs/ai-inventory-manager-era182-setup.md" as const;

export const AI_INVENTORY_MANAGER_ERA182_CANONICAL_OPS_DOC = AI_INVENTORY_MANAGER_ERA107_OPS_DOC;

export const AI_INVENTORY_MANAGER_ERA182_CANONICAL_SUMMARY_ARTIFACT =
  AI_INVENTORY_MANAGER_ERA107_SUMMARY_ARTIFACT;

export const AI_INVENTORY_MANAGER_ERA182_WIRING_PATHS = AI_INVENTORY_MANAGER_ERA107_WIRING_PATHS;

export const AI_INVENTORY_MANAGER_ERA182_SERVICE = AI_INVENTORY_MANAGER_ERA107_SERVICE;

export const AI_INVENTORY_MANAGER_ERA182_ROUTE = AI_INVENTORY_MANAGER_ERA107_ROUTE;

export const AI_INVENTORY_MANAGER_ERA182_CAPABILITIES = AI_INVENTORY_MANAGER_ERA107_CAPABILITIES;

export const AI_INVENTORY_MANAGER_ERA182_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Inventory → AI Inventory Manager.",
  "Verify daily inventory brief with waste, theft, and shrinkage summary.",
  "Review theft detection signals and waste-by-reason cards.",
  "Check count shrinkage from completed inventory counts.",
  "Run npm run smoke:ai-inventory-manager-era107 — canonical era107 wiring cert PASSED.",
  "Run npm run smoke:ai-inventory-manager-era182 — artifact overall PASSED.",
] as const;

export const AI_INVENTORY_MANAGER_ERA182_CI_SCRIPTS = [
  "test:ci:ai-inventory-manager-era182",
  "test:ci:ai-inventory-manager-era182:cert",
] as const;

export const AI_INVENTORY_MANAGER_ERA182_UNIT_TESTS = [
  "tests/unit/ai-inventory-manager-era182.test.ts",
  "tests/unit/ai-inventory-manager-era107.test.ts",
  "tests/unit/inventory-manager.test.ts",
] as const;

export const AI_INVENTORY_MANAGER_ERA182_CANONICAL_POLICY_ID = AI_INVENTORY_MANAGER_ERA107_POLICY_ID;
