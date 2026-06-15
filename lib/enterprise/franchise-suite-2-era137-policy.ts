/**
 * Era 137 — Franchise Management Suite wiring cert (Phase 9 #64).
 *
 * Full path: royalty tracking → compliance checklist → rollout phases.
 */

import {
  FRANCHISE_COMPLIANCE_CHECK_IDS,
  FRANCHISE_ROLLOUT_PHASES,
  FRANCHISE_SUITE_2_PATH,
  FRANCHISE_SUITE_2_POLICY_ID,
} from "@/lib/enterprise/franchise-suite-2-policy";

export const FRANCHISE_SUITE_2_ERA137_POLICY_ID = "era137-franchise-suite-2-v1" as const;

export const FRANCHISE_SUITE_2_ERA137_SUMMARY_ARTIFACT =
  "artifacts/franchise-suite-2-smoke-summary.json" as const;

export const FRANCHISE_SUITE_2_ERA137_NPM_SCRIPT = "smoke:franchise-suite-2-era137" as const;

export const FRANCHISE_SUITE_2_ERA137_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-franchise-suite-2-era137.ts" as const;

export const FRANCHISE_SUITE_2_ERA137_OPS_DOC = "docs/franchise-suite-2-era137-setup.md" as const;

export const FRANCHISE_SUITE_2_ERA137_SERVICE = "services/enterprise/franchise-service.ts" as const;

export const FRANCHISE_SUITE_2_ERA137_WIRING_PATHS = [
  FRANCHISE_SUITE_2_ERA137_SERVICE,
  "lib/enterprise/franchise-suite-2-builders.ts",
  "lib/enterprise/franchise-suite-2-policy.ts",
  "lib/enterprise/franchise-builders.ts",
  "app/dashboard/enterprise/franchise/page.tsx",
  "components/enterprise/franchise-suite-panel.tsx",
] as const;

export const FRANCHISE_SUITE_2_ERA137_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → Franchise.",
  "Review KPIs — royalties, compliance pass rate, certified units.",
  "Inspect Rollout pipeline — discovery → training → go-live → certified.",
  "Review unit table — royalty, menu compliance, rollout phase per franchisee.",
  "Run npm run smoke:franchise-suite-2-era137 — artifact overall PASSED.",
] as const;

export const FRANCHISE_SUITE_2_ERA137_CI_SCRIPTS = [
  "test:ci:franchise-suite-2-era137",
  "test:ci:franchise-suite-2-era137:cert",
] as const;

export const FRANCHISE_SUITE_2_ERA137_UNIT_TESTS = [
  "tests/unit/franchise-suite-2-era137.test.ts",
  "tests/unit/franchise-suite-2.test.ts",
] as const;

export const FRANCHISE_SUITE_2_ERA137_CANONICAL_POLICY_ID = FRANCHISE_SUITE_2_POLICY_ID;

export const FRANCHISE_SUITE_2_ERA137_ROUTE = FRANCHISE_SUITE_2_PATH;

export const FRANCHISE_SUITE_2_ERA137_ROLLOUT_PHASES = FRANCHISE_ROLLOUT_PHASES;

export const FRANCHISE_SUITE_2_ERA137_COMPLIANCE_CHECKS = FRANCHISE_COMPLIANCE_CHECK_IDS;

export const FRANCHISE_SUITE_2_ERA137_CAPABILITIES = [
  "royalty",
  "compliance",
  "rollout",
] as const;
