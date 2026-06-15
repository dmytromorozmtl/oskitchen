/**
 * Era 112 — Commissary OS wiring cert (Phase 5 extension #112).
 *
 * Full path: production + purchasing + delivery + distribution → four pillars → dashboard.
 */

import { ENTERPRISE_COMMISSARY_POLICY_ID } from "@/lib/enterprise/commissary-policy";

export const COMMISSARY_OS_ERA112_POLICY_ID = "era112-commissary-os-v1" as const;

export const COMMISSARY_OS_ERA112_SUMMARY_ARTIFACT =
  "artifacts/commissary-os-smoke-summary.json" as const;

export const COMMISSARY_OS_ERA112_NPM_SCRIPT = "smoke:commissary-os-era112" as const;

export const COMMISSARY_OS_ERA112_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-commissary-os-era112.ts" as const;

export const COMMISSARY_OS_ERA112_OPS_DOC = "docs/commissary-os-era112-setup.md" as const;

export const COMMISSARY_OS_ERA112_WIRING_PATHS = [
  "services/enterprise/commissary-service.ts",
  "lib/enterprise/commissary-builders.ts",
  "lib/enterprise/commissary-policy.ts",
  "app/dashboard/enterprise/commissary/page.tsx",
  "components/enterprise/commissary-enterprise-panel.tsx",
] as const;

export const COMMISSARY_OS_ERA112_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → Commissary OS.",
  "Verify four pillar cards — Production, Purchasing, Delivery, Distribution.",
  "Review commissary alerts and upcoming production tasks.",
  "Check recent transfers and distribution status.",
  "Run npm run smoke:commissary-os-era112 — artifact overall PASSED.",
] as const;

export const COMMISSARY_OS_ERA112_CI_SCRIPTS = [
  "test:ci:commissary-os-era112",
  "test:ci:commissary-os-era112:cert",
] as const;

export const COMMISSARY_OS_ERA112_UNIT_TESTS = [
  "tests/unit/commissary-os-era112.test.ts",
  "tests/unit/commissary-enterprise.test.ts",
] as const;

export const COMMISSARY_OS_ERA112_CANONICAL_POLICY_ID = ENTERPRISE_COMMISSARY_POLICY_ID;

export const COMMISSARY_OS_ERA112_SERVICE = "services/enterprise/commissary-service.ts" as const;

export const COMMISSARY_OS_ERA112_ROUTE = "/dashboard/enterprise/commissary" as const;

export const COMMISSARY_OS_ERA112_PILLARS = [
  "production",
  "purchasing",
  "delivery",
  "distribution",
] as const;
