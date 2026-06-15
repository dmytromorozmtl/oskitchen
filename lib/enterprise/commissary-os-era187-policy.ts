/**
 * Era 187 — Commissary OS wiring cert (Phase 5 Round 2 #39).
 *
 * Full path: production + purchasing + delivery + distribution → four pillars → dashboard.
 */

import {
  COMMISSARY_OS_ERA112_OPS_DOC,
  COMMISSARY_OS_ERA112_PILLARS,
  COMMISSARY_OS_ERA112_POLICY_ID,
  COMMISSARY_OS_ERA112_ROUTE,
  COMMISSARY_OS_ERA112_SERVICE,
  COMMISSARY_OS_ERA112_SUMMARY_ARTIFACT,
  COMMISSARY_OS_ERA112_WIRING_PATHS,
} from "@/lib/enterprise/commissary-os-era112-policy";

export const COMMISSARY_OS_ERA187_POLICY_ID = "era187-commissary-os-v1" as const;

export const COMMISSARY_OS_ERA187_SUMMARY_ARTIFACT =
  "artifacts/commissary-os-era187-smoke-summary.json" as const;

export const COMMISSARY_OS_ERA187_NPM_SCRIPT = "smoke:commissary-os-era187" as const;

export const COMMISSARY_OS_ERA187_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-commissary-os-era187.ts" as const;

export const COMMISSARY_OS_ERA187_OPS_DOC = "docs/commissary-os-era187-setup.md" as const;

export const COMMISSARY_OS_ERA187_CANONICAL_OPS_DOC = COMMISSARY_OS_ERA112_OPS_DOC;

export const COMMISSARY_OS_ERA187_CANONICAL_SUMMARY_ARTIFACT =
  COMMISSARY_OS_ERA112_SUMMARY_ARTIFACT;

export const COMMISSARY_OS_ERA187_WIRING_PATHS = COMMISSARY_OS_ERA112_WIRING_PATHS;

export const COMMISSARY_OS_ERA187_SERVICE = COMMISSARY_OS_ERA112_SERVICE;

export const COMMISSARY_OS_ERA187_ROUTE = COMMISSARY_OS_ERA112_ROUTE;

export const COMMISSARY_OS_ERA187_PILLARS = COMMISSARY_OS_ERA112_PILLARS;

export const COMMISSARY_OS_ERA187_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → Commissary OS.",
  "Verify four pillar cards — Production, Purchasing, Delivery, Distribution.",
  "Review commissary alerts and upcoming production tasks.",
  "Check recent transfers and distribution status.",
  "Run npm run smoke:commissary-os-era112 — canonical era112 wiring cert PASSED.",
  "Run npm run smoke:commissary-os-era187 — artifact overall PASSED.",
] as const;

export const COMMISSARY_OS_ERA187_CI_SCRIPTS = [
  "test:ci:commissary-os-era187",
  "test:ci:commissary-os-era187:cert",
] as const;

export const COMMISSARY_OS_ERA187_UNIT_TESTS = [
  "tests/unit/commissary-os-era187.test.ts",
  "tests/unit/commissary-os-era112.test.ts",
  "tests/unit/commissary-enterprise.test.ts",
] as const;

export const COMMISSARY_OS_ERA187_CANONICAL_POLICY_ID = COMMISSARY_OS_ERA112_POLICY_ID;
