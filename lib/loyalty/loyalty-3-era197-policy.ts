/**
 * Era 197 — Loyalty 3.0 wiring cert (Phase 7 Round 2 #49).
 *
 * Full path: cross-brand pool → VIP multipliers → event bonuses → referrals.
 */

import {
  LOYALTY_3_ERA122_OPS_DOC,
  LOYALTY_3_ERA122_PILLARS,
  LOYALTY_3_ERA122_POLICY_ID,
  LOYALTY_3_ERA122_ROUTE,
  LOYALTY_3_ERA122_SERVICE,
  LOYALTY_3_ERA122_SUMMARY_ARTIFACT,
  LOYALTY_3_ERA122_WIRING_PATHS,
} from "@/lib/loyalty/loyalty-3-era122-policy";

export const LOYALTY_3_ERA197_POLICY_ID = "era197-loyalty-3-v1" as const;

export const LOYALTY_3_ERA197_SUMMARY_ARTIFACT =
  "artifacts/loyalty-3-era197-smoke-summary.json" as const;

export const LOYALTY_3_ERA197_NPM_SCRIPT = "smoke:loyalty-3-era197" as const;

export const LOYALTY_3_ERA197_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-loyalty-3-era197.ts" as const;

export const LOYALTY_3_ERA197_OPS_DOC = "docs/loyalty-3-era197-setup.md" as const;

export const LOYALTY_3_ERA197_CANONICAL_OPS_DOC = LOYALTY_3_ERA122_OPS_DOC;

export const LOYALTY_3_ERA197_CANONICAL_SUMMARY_ARTIFACT = LOYALTY_3_ERA122_SUMMARY_ARTIFACT;

export const LOYALTY_3_ERA197_WIRING_PATHS = LOYALTY_3_ERA122_WIRING_PATHS;

export const LOYALTY_3_ERA197_SERVICE = LOYALTY_3_ERA122_SERVICE;

export const LOYALTY_3_ERA197_ROUTE = LOYALTY_3_ERA122_ROUTE;

export const LOYALTY_3_ERA197_PILLARS = LOYALTY_3_ERA122_PILLARS;

export const LOYALTY_3_ERA197_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Loyalty → Loyalty 3.0.",
  "Review summary — members, cross-brand points, VIP count, referral bonuses.",
  "Check cross-brand lanes, VIP members, event opportunities, and referrals.",
  "Save Loyalty 3.0 settings — cross-brand pool, VIP multiplier, event bonuses.",
  "Run npm run smoke:loyalty-3-era122 — canonical era122 wiring cert PASSED.",
  "Run npm run smoke:loyalty-3-era197 — artifact overall PASSED.",
] as const;

export const LOYALTY_3_ERA197_CI_SCRIPTS = [
  "test:ci:loyalty-3-era197",
  "test:ci:loyalty-3-era197:cert",
] as const;

export const LOYALTY_3_ERA197_UNIT_TESTS = [
  "tests/unit/loyalty-3-era197.test.ts",
  "tests/unit/loyalty-3-era122.test.ts",
  "tests/unit/loyalty-3.0-service.test.ts",
] as const;

export const LOYALTY_3_ERA197_CANONICAL_POLICY_ID = LOYALTY_3_ERA122_POLICY_ID;
