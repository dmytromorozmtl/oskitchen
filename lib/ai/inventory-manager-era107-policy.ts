/**
 * Era 107 — AI Inventory Manager wiring cert (Phase 4 extension #107).
 *
 * Full path: waste events + theft alerts + count variance → signals → daily brief → dashboard.
 */

import { AI_INVENTORY_MANAGER_POLICY_ID } from "@/lib/ai/inventory-manager-policy";

export const AI_INVENTORY_MANAGER_ERA107_POLICY_ID = "era107-ai-inventory-manager-v1" as const;

export const AI_INVENTORY_MANAGER_ERA107_SUMMARY_ARTIFACT =
  "artifacts/ai-inventory-manager-smoke-summary.json" as const;

export const AI_INVENTORY_MANAGER_ERA107_NPM_SCRIPT = "smoke:ai-inventory-manager-era107" as const;

export const AI_INVENTORY_MANAGER_ERA107_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-ai-inventory-manager-era107.ts" as const;

export const AI_INVENTORY_MANAGER_ERA107_OPS_DOC = "docs/ai-inventory-manager-era107-setup.md" as const;

export const AI_INVENTORY_MANAGER_ERA107_WIRING_PATHS = [
  "services/ai/inventory-manager.ts",
  "lib/ai/inventory-manager-builders.ts",
  "lib/ai/inventory-manager-policy.ts",
  "app/dashboard/inventory/manager/page.tsx",
  "components/inventory/inventory-manager-client.tsx",
] as const;

export const AI_INVENTORY_MANAGER_ERA107_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Inventory → AI Inventory Manager.",
  "Verify daily inventory brief with waste, theft, and shrinkage summary.",
  "Review theft detection signals and waste-by-reason cards.",
  "Check count shrinkage from completed inventory counts.",
  "Run npm run smoke:ai-inventory-manager-era107 — artifact overall PASSED.",
] as const;

export const AI_INVENTORY_MANAGER_ERA107_CI_SCRIPTS = [
  "test:ci:ai-inventory-manager-era107",
  "test:ci:ai-inventory-manager-era107:cert",
] as const;

export const AI_INVENTORY_MANAGER_ERA107_UNIT_TESTS = [
  "tests/unit/ai-inventory-manager-era107.test.ts",
  "tests/unit/inventory-manager.test.ts",
] as const;

export const AI_INVENTORY_MANAGER_ERA107_CANONICAL_POLICY_ID = AI_INVENTORY_MANAGER_POLICY_ID;

export const AI_INVENTORY_MANAGER_ERA107_SERVICE = "services/ai/inventory-manager.ts" as const;

export const AI_INVENTORY_MANAGER_ERA107_ROUTE = "/dashboard/inventory/manager" as const;

export const AI_INVENTORY_MANAGER_ERA107_CAPABILITIES = [
  "waste",
  "theft",
  "shrinkage",
  "daily_brief",
] as const;
