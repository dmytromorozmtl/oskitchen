/**
 * Era 122 — Loyalty 3.0 wiring cert (Phase 7 #49).
 *
 * Full path: cross-brand pool → VIP multipliers → event bonuses → referrals.
 */

import {
  LOYALTY_3_PATH,
  LOYALTY_3_POLICY_ID,
  LOYALTY_3_SERVICE,
} from "@/lib/loyalty/loyalty-3-policy";

export const LOYALTY_3_ERA122_POLICY_ID = "era122-loyalty-3-v1" as const;

export const LOYALTY_3_ERA122_SUMMARY_ARTIFACT =
  "artifacts/loyalty-3-smoke-summary.json" as const;

export const LOYALTY_3_ERA122_NPM_SCRIPT = "smoke:loyalty-3-era122" as const;

export const LOYALTY_3_ERA122_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-loyalty-3-era122.ts" as const;

export const LOYALTY_3_ERA122_OPS_DOC = "docs/loyalty-3-era122-setup.md" as const;

export const LOYALTY_3_ERA122_WIRING_PATHS = [
  LOYALTY_3_SERVICE,
  "lib/loyalty/loyalty-3-builders.ts",
  "lib/loyalty/loyalty-3-policy.ts",
  "app/dashboard/loyalty/loyalty-3/page.tsx",
  "components/loyalty/loyalty-3-panel.tsx",
  "actions/loyalty-3.ts",
] as const;

export const LOYALTY_3_ERA122_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Loyalty → Loyalty 3.0.",
  "Review summary — members, cross-brand points, VIP count, referral bonuses.",
  "Check cross-brand lanes, VIP members, event opportunities, and referrals.",
  "Save Loyalty 3.0 settings — cross-brand pool, VIP multiplier, event bonuses.",
  "Run npm run smoke:loyalty-3-era122 — artifact overall PASSED.",
] as const;

export const LOYALTY_3_ERA122_CI_SCRIPTS = [
  "test:ci:loyalty-3-era122",
  "test:ci:loyalty-3-era122:cert",
] as const;

export const LOYALTY_3_ERA122_UNIT_TESTS = [
  "tests/unit/loyalty-3-era122.test.ts",
  "tests/unit/loyalty-3.0-service.test.ts",
] as const;

export const LOYALTY_3_ERA122_CANONICAL_POLICY_ID = LOYALTY_3_POLICY_ID;

export const LOYALTY_3_ERA122_SERVICE = LOYALTY_3_SERVICE;

export const LOYALTY_3_ERA122_ROUTE = LOYALTY_3_PATH;

export const LOYALTY_3_ERA122_PILLARS = [
  "cross-brand",
  "vip",
  "events",
  "referrals",
] as const;
