/**
 * Era 113 — Catering OS wiring cert (Phase 5 extension #113).
 *
 * Full path: events + clients + packing + routes → four modules → dashboard.
 */

import { CATERING_OS_POLICY_ID } from "@/lib/catering/catering-os-policy";

export const CATERING_OS_ERA113_POLICY_ID = "era113-catering-os-v1" as const;

export const CATERING_OS_ERA113_SUMMARY_ARTIFACT =
  "artifacts/catering-os-smoke-summary.json" as const;

export const CATERING_OS_ERA113_NPM_SCRIPT = "smoke:catering-os-era113" as const;

export const CATERING_OS_ERA113_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-catering-os-era113.ts" as const;

export const CATERING_OS_ERA113_OPS_DOC = "docs/catering-os-era113-setup.md" as const;

export const CATERING_OS_ERA113_WIRING_PATHS = [
  "services/catering/catering-os-service.ts",
  "lib/catering/catering-os-builders.ts",
  "lib/catering/catering-os-policy.ts",
  "app/dashboard/catering/page.tsx",
  "components/catering/catering-os-panel.tsx",
] as const;

export const CATERING_OS_ERA113_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Catering OS.",
  "Verify four module cards — Events, Clients, Packing, Routes.",
  "Review upcoming events and top clients pipeline.",
  "Check packing tasks and delivery route KPIs.",
  "Run npm run smoke:catering-os-era113 — artifact overall PASSED.",
] as const;

export const CATERING_OS_ERA113_CI_SCRIPTS = [
  "test:ci:catering-os-era113",
  "test:ci:catering-os-era113:cert",
] as const;

export const CATERING_OS_ERA113_UNIT_TESTS = [
  "tests/unit/catering-os-era113.test.ts",
  "tests/unit/catering-os.test.ts",
] as const;

export const CATERING_OS_ERA113_CANONICAL_POLICY_ID = CATERING_OS_POLICY_ID;

export const CATERING_OS_ERA113_SERVICE = "services/catering/catering-os-service.ts" as const;

export const CATERING_OS_ERA113_ROUTE = "/dashboard/catering" as const;

export const CATERING_OS_ERA113_MODULES = [
  "events",
  "clients",
  "packing",
  "routes",
] as const;
