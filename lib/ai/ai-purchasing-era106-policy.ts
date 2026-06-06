/**
 * Era 106 — AI Purchasing Manager wiring cert (Phase 4 extension #106).
 *
 * Full path: demand + suppliers → shortage prediction → price optimization → daily brief → dashboard.
 */

export const AI_PURCHASING_ERA106_POLICY_ID = "era106-ai-purchasing-manager-v1" as const;

export const AI_PURCHASING_ERA106_SUMMARY_ARTIFACT =
  "artifacts/ai-purchasing-smoke-summary.json" as const;

export const AI_PURCHASING_ERA106_NPM_SCRIPT = "smoke:ai-purchasing-era106" as const;

export const AI_PURCHASING_ERA106_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-ai-purchasing-era106.ts" as const;

export const AI_PURCHASING_ERA106_OPS_DOC = "docs/ai-purchasing-era106-setup.md" as const;

export const AI_PURCHASING_ERA106_WIRING_PATHS = [
  "services/ai/ai-purchasing.ts",
  "lib/ai/ai-purchasing-builders.ts",
  "services/ai/ai-purchasing-dashboard.ts",
  "app/dashboard/inventory/purchasing-ai/page.tsx",
  "components/dashboard/purchasing-ai-dashboard.tsx",
] as const;

export const AI_PURCHASING_ERA106_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Inventory → AI Purchasing.",
  "Verify daily purchasing brief with shortage signals and price switch count.",
  "Review recommendations — confirm alternative supplier savings and EOQ quantities.",
  "Order one item or Order All — draft PO created in Purchasing.",
  "Run npm run smoke:ai-purchasing-era106 — artifact overall PASSED.",
] as const;

export const AI_PURCHASING_ERA106_CI_SCRIPTS = [
  "test:ci:ai-purchasing-era106",
  "test:ci:ai-purchasing-era106:cert",
] as const;

export const AI_PURCHASING_ERA106_UNIT_TESTS = [
  "tests/unit/ai-purchasing-era106.test.ts",
  "tests/unit/ai-purchasing-builders.test.ts",
] as const;

export const AI_PURCHASING_ERA106_SERVICE = "services/ai/ai-purchasing.ts" as const;

export const AI_PURCHASING_ERA106_ROUTE = "/dashboard/inventory/purchasing-ai" as const;

export const AI_PURCHASING_ERA106_CAPABILITIES = [
  "shortage_prediction",
  "price_optimization",
  "alternative_supplier",
  "daily_brief",
] as const;
