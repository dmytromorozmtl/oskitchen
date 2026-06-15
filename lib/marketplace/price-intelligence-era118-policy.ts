/**
 * Era 118 — Price Intelligence wiring cert (Phase 6 extension #118).
 *
 * Full path: spend scan → cheapest supplier → switch recommendations → auto-switch.
 */

import { PRICE_INTELLIGENCE_POLICY_ID } from "@/lib/marketplace/price-intelligence-policy";

export const PRICE_INTELLIGENCE_ERA118_POLICY_ID = "era118-price-intelligence-v1" as const;

export const PRICE_INTELLIGENCE_ERA118_SUMMARY_ARTIFACT =
  "artifacts/price-intelligence-smoke-summary.json" as const;

export const PRICE_INTELLIGENCE_ERA118_NPM_SCRIPT = "smoke:price-intelligence-era118" as const;

export const PRICE_INTELLIGENCE_ERA118_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-price-intelligence-era118.ts" as const;

export const PRICE_INTELLIGENCE_ERA118_OPS_DOC = "docs/price-intelligence-era118-setup.md" as const;

export const PRICE_INTELLIGENCE_ERA118_WIRING_PATHS = [
  "services/marketplace/price-intelligence.ts",
  "lib/marketplace/price-intelligence-builders.ts",
  "lib/marketplace/price-intelligence-policy.ts",
  "actions/marketplace/price-intelligence.ts",
  "app/dashboard/marketplace/price-intelligence/page.tsx",
  "components/marketplace/price-intelligence-panel.tsx",
] as const;

export const PRICE_INTELLIGENCE_ERA118_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Marketplace → Price Intelligence.",
  "Review switch opportunities and monthly savings summary.",
  "Toggle auto-switch policy and verify preference persists.",
  "Apply a switch recommendation — confirm cart redirect to checkout.",
  "Run npm run smoke:price-intelligence-era118 — artifact overall PASSED.",
] as const;

export const PRICE_INTELLIGENCE_ERA118_CI_SCRIPTS = [
  "test:ci:price-intelligence-era118",
  "test:ci:price-intelligence-era118:cert",
] as const;

export const PRICE_INTELLIGENCE_ERA118_UNIT_TESTS = [
  "tests/unit/price-intelligence-era118.test.ts",
  "tests/unit/price-intelligence.test.ts",
] as const;

export const PRICE_INTELLIGENCE_ERA118_CANONICAL_POLICY_ID = PRICE_INTELLIGENCE_POLICY_ID;

export const PRICE_INTELLIGENCE_ERA118_SERVICE =
  "services/marketplace/price-intelligence.ts" as const;

export const PRICE_INTELLIGENCE_ERA118_ROUTE =
  "/dashboard/marketplace/price-intelligence" as const;

export const PRICE_INTELLIGENCE_ERA118_CAPABILITIES = [
  "cheapest_supplier",
  "auto_switch",
  "spend_scan",
] as const;
