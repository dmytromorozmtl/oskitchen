/**
 * Era 196 — Unified Customer Profile wiring cert (Phase 7 Round 2 #48).
 *
 * Full path: orders → preferences → history → loyalty in one customer view.
 */

import {
  UNIFIED_PROFILE_ERA121_OPS_DOC,
  UNIFIED_PROFILE_ERA121_POLICY_ID,
  UNIFIED_PROFILE_ERA121_PROFILE_SECTIONS,
  UNIFIED_PROFILE_ERA121_ROUTE,
  UNIFIED_PROFILE_ERA121_SERVICE,
  UNIFIED_PROFILE_ERA121_SUMMARY_ARTIFACT,
  UNIFIED_PROFILE_ERA121_WIRING_PATHS,
} from "@/lib/crm/unified-profile-era121-policy";

export const UNIFIED_PROFILE_ERA196_POLICY_ID = "era196-unified-customer-profile-v1" as const;

export const UNIFIED_PROFILE_ERA196_SUMMARY_ARTIFACT =
  "artifacts/unified-profile-era196-smoke-summary.json" as const;

export const UNIFIED_PROFILE_ERA196_NPM_SCRIPT = "smoke:unified-profile-era196" as const;

export const UNIFIED_PROFILE_ERA196_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-unified-profile-era196.ts" as const;

export const UNIFIED_PROFILE_ERA196_OPS_DOC = "docs/unified-profile-era196-setup.md" as const;

export const UNIFIED_PROFILE_ERA196_CANONICAL_OPS_DOC = UNIFIED_PROFILE_ERA121_OPS_DOC;

export const UNIFIED_PROFILE_ERA196_CANONICAL_SUMMARY_ARTIFACT =
  UNIFIED_PROFILE_ERA121_SUMMARY_ARTIFACT;

export const UNIFIED_PROFILE_ERA196_WIRING_PATHS = UNIFIED_PROFILE_ERA121_WIRING_PATHS;

export const UNIFIED_PROFILE_ERA196_SERVICE = UNIFIED_PROFILE_ERA121_SERVICE;

export const UNIFIED_PROFILE_ERA196_ROUTE = UNIFIED_PROFILE_ERA121_ROUTE;

export const UNIFIED_PROFILE_ERA196_PROFILE_SECTIONS = UNIFIED_PROFILE_ERA121_PROFILE_SECTIONS;

export const UNIFIED_PROFILE_ERA196_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Customers → Unified Customer Profiles.",
  "Review hub summary — customers, with orders, with loyalty.",
  "Open a top customer unified profile — orders, preferences, history, loyalty.",
  "Verify order history links and loyalty transactions render.",
  "Run npm run smoke:unified-profile-era121 — canonical era121 wiring cert PASSED.",
  "Run npm run smoke:unified-profile-era196 — artifact overall PASSED.",
] as const;

export const UNIFIED_PROFILE_ERA196_CI_SCRIPTS = [
  "test:ci:unified-profile-era196",
  "test:ci:unified-profile-era196:cert",
] as const;

export const UNIFIED_PROFILE_ERA196_UNIT_TESTS = [
  "tests/unit/unified-profile-era196.test.ts",
  "tests/unit/unified-profile-era121.test.ts",
  "tests/unit/unified-profile.test.ts",
] as const;

export const UNIFIED_PROFILE_ERA196_CANONICAL_POLICY_ID = UNIFIED_PROFILE_ERA121_POLICY_ID;
