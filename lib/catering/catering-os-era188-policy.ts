/**
 * Era 188 — Catering OS wiring cert (Phase 5 Round 2 #40).
 *
 * Full path: events + clients + packing + routes → four modules → dashboard.
 */

import {
  CATERING_OS_ERA113_MODULES,
  CATERING_OS_ERA113_OPS_DOC,
  CATERING_OS_ERA113_POLICY_ID,
  CATERING_OS_ERA113_ROUTE,
  CATERING_OS_ERA113_SERVICE,
  CATERING_OS_ERA113_SUMMARY_ARTIFACT,
  CATERING_OS_ERA113_WIRING_PATHS,
} from "@/lib/catering/catering-os-era113-policy";

export const CATERING_OS_ERA188_POLICY_ID = "era188-catering-os-v1" as const;

export const CATERING_OS_ERA188_SUMMARY_ARTIFACT =
  "artifacts/catering-os-era188-smoke-summary.json" as const;

export const CATERING_OS_ERA188_NPM_SCRIPT = "smoke:catering-os-era188" as const;

export const CATERING_OS_ERA188_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-catering-os-era188.ts" as const;

export const CATERING_OS_ERA188_OPS_DOC = "docs/catering-os-era188-setup.md" as const;

export const CATERING_OS_ERA188_CANONICAL_OPS_DOC = CATERING_OS_ERA113_OPS_DOC;

export const CATERING_OS_ERA188_CANONICAL_SUMMARY_ARTIFACT =
  CATERING_OS_ERA113_SUMMARY_ARTIFACT;

export const CATERING_OS_ERA188_WIRING_PATHS = CATERING_OS_ERA113_WIRING_PATHS;

export const CATERING_OS_ERA188_SERVICE = CATERING_OS_ERA113_SERVICE;

export const CATERING_OS_ERA188_ROUTE = CATERING_OS_ERA113_ROUTE;

export const CATERING_OS_ERA188_MODULES = CATERING_OS_ERA113_MODULES;

export const CATERING_OS_ERA188_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Catering OS.",
  "Verify four module cards — Events, Clients, Packing, Routes.",
  "Review upcoming events and top clients pipeline.",
  "Check packing tasks and delivery route KPIs.",
  "Run npm run smoke:catering-os-era113 — canonical era113 wiring cert PASSED.",
  "Run npm run smoke:catering-os-era188 — artifact overall PASSED.",
] as const;

export const CATERING_OS_ERA188_CI_SCRIPTS = [
  "test:ci:catering-os-era188",
  "test:ci:catering-os-era188:cert",
] as const;

export const CATERING_OS_ERA188_UNIT_TESTS = [
  "tests/unit/catering-os-era188.test.ts",
  "tests/unit/catering-os-era113.test.ts",
  "tests/unit/catering-os.test.ts",
] as const;

export const CATERING_OS_ERA188_CANONICAL_POLICY_ID = CATERING_OS_ERA113_POLICY_ID;
