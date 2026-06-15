/**
 * Era 121 — Unified Customer Profile wiring cert (Phase 7 #48).
 *
 * Full path: orders → preferences → history → loyalty in one customer view.
 */

import {
  UNIFIED_PROFILE_PATH,
  UNIFIED_PROFILE_POLICY_ID,
  UNIFIED_PROFILE_SERVICE,
} from "@/lib/crm/unified-profile-policy";

export const UNIFIED_PROFILE_ERA121_POLICY_ID = "era121-unified-customer-profile-v1" as const;

export const UNIFIED_PROFILE_ERA121_SUMMARY_ARTIFACT =
  "artifacts/unified-profile-smoke-summary.json" as const;

export const UNIFIED_PROFILE_ERA121_NPM_SCRIPT = "smoke:unified-profile-era121" as const;

export const UNIFIED_PROFILE_ERA121_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-unified-profile-era121.ts" as const;

export const UNIFIED_PROFILE_ERA121_OPS_DOC = "docs/unified-profile-era121-setup.md" as const;

export const UNIFIED_PROFILE_ERA121_WIRING_PATHS = [
  UNIFIED_PROFILE_SERVICE,
  "lib/crm/unified-profile-builders.ts",
  "lib/crm/unified-profile-policy.ts",
  "app/dashboard/customers/unified-profile/page.tsx",
  "app/dashboard/customers/unified-profile/[customerId]/page.tsx",
  "components/crm/unified-customer-profile-panel.tsx",
] as const;

export const UNIFIED_PROFILE_ERA121_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Customers → Unified Customer Profiles.",
  "Review hub summary — customers, with orders, with loyalty.",
  "Open a top customer unified profile — orders, preferences, history, loyalty.",
  "Verify order history links and loyalty transactions render.",
  "Run npm run smoke:unified-profile-era121 — artifact overall PASSED.",
] as const;

export const UNIFIED_PROFILE_ERA121_CI_SCRIPTS = [
  "test:ci:unified-profile-era121",
  "test:ci:unified-profile-era121:cert",
] as const;

export const UNIFIED_PROFILE_ERA121_UNIT_TESTS = [
  "tests/unit/unified-profile-era121.test.ts",
  "tests/unit/unified-profile.test.ts",
] as const;

export const UNIFIED_PROFILE_ERA121_CANONICAL_POLICY_ID = UNIFIED_PROFILE_POLICY_ID;

export const UNIFIED_PROFILE_ERA121_SERVICE = UNIFIED_PROFILE_SERVICE;

export const UNIFIED_PROFILE_ERA121_ROUTE = UNIFIED_PROFILE_PATH;

export const UNIFIED_PROFILE_ERA121_PROFILE_SECTIONS = [
  "orders",
  "preferences",
  "history",
  "loyalty",
] as const;
