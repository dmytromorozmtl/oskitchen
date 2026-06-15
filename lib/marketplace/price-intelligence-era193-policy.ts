/**
 * Era 193 — Price Intelligence wiring cert (Phase 6 Round 2 #45).
 *
 * Full path: spend scan → cheapest supplier → switch recommendations → auto-switch.
 */

import {
  PRICE_INTELLIGENCE_ERA118_CAPABILITIES,
  PRICE_INTELLIGENCE_ERA118_OPS_DOC,
  PRICE_INTELLIGENCE_ERA118_POLICY_ID,
  PRICE_INTELLIGENCE_ERA118_ROUTE,
  PRICE_INTELLIGENCE_ERA118_SERVICE,
  PRICE_INTELLIGENCE_ERA118_SUMMARY_ARTIFACT,
  PRICE_INTELLIGENCE_ERA118_WIRING_PATHS,
} from "@/lib/marketplace/price-intelligence-era118-policy";

export const PRICE_INTELLIGENCE_ERA193_POLICY_ID = "era193-price-intelligence-v1" as const;

export const PRICE_INTELLIGENCE_ERA193_SUMMARY_ARTIFACT =
  "artifacts/price-intelligence-era193-smoke-summary.json" as const;

export const PRICE_INTELLIGENCE_ERA193_NPM_SCRIPT = "smoke:price-intelligence-era193" as const;

export const PRICE_INTELLIGENCE_ERA193_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-price-intelligence-era193.ts" as const;

export const PRICE_INTELLIGENCE_ERA193_OPS_DOC = "docs/price-intelligence-era193-setup.md" as const;

export const PRICE_INTELLIGENCE_ERA193_CANONICAL_OPS_DOC = PRICE_INTELLIGENCE_ERA118_OPS_DOC;

export const PRICE_INTELLIGENCE_ERA193_CANONICAL_SUMMARY_ARTIFACT =
  PRICE_INTELLIGENCE_ERA118_SUMMARY_ARTIFACT;

export const PRICE_INTELLIGENCE_ERA193_WIRING_PATHS = PRICE_INTELLIGENCE_ERA118_WIRING_PATHS;

export const PRICE_INTELLIGENCE_ERA193_SERVICE = PRICE_INTELLIGENCE_ERA118_SERVICE;

export const PRICE_INTELLIGENCE_ERA193_ROUTE = PRICE_INTELLIGENCE_ERA118_ROUTE;

export const PRICE_INTELLIGENCE_ERA193_CAPABILITIES = PRICE_INTELLIGENCE_ERA118_CAPABILITIES;

export const PRICE_INTELLIGENCE_ERA193_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Marketplace → Price Intelligence.",
  "Review switch opportunities and monthly savings summary.",
  "Toggle auto-switch policy and verify preference persists.",
  "Apply a switch recommendation — confirm cart redirect to checkout.",
  "Run npm run smoke:price-intelligence-era118 — canonical era118 wiring cert PASSED.",
  "Run npm run smoke:price-intelligence-era193 — artifact overall PASSED.",
] as const;

export const PRICE_INTELLIGENCE_ERA193_CI_SCRIPTS = [
  "test:ci:price-intelligence-era193",
  "test:ci:price-intelligence-era193:cert",
] as const;

export const PRICE_INTELLIGENCE_ERA193_UNIT_TESTS = [
  "tests/unit/price-intelligence-era193.test.ts",
  "tests/unit/price-intelligence-era118.test.ts",
  "tests/unit/price-intelligence.test.ts",
] as const;

export const PRICE_INTELLIGENCE_ERA193_CANONICAL_POLICY_ID = PRICE_INTELLIGENCE_ERA118_POLICY_ID;
