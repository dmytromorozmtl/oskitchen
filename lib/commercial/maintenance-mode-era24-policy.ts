/**
 * Maintenance mode — Era 24 Step 12 product + CLI wiring (path terminus).
 */

import { MAINTENANCE_MODE_PHASES_ERA24_POLICY_ID } from "@/lib/commercial/maintenance-mode-phases-era24";
import { MAINTENANCE_MODE_UI_ERA24_POLICY_ID } from "@/lib/commercial/maintenance-mode-ui-era24";

export const MAINTENANCE_MODE_ERA24_POLICY_ID = "era24-maintenance-mode-v1" as const;

export const MAINTENANCE_MODE_ERA24_BACKLOG_ID = "KOS-E24-012" as const;

export const MAINTENANCE_MODE_ERA24_EXTENDS_POLICIES = [
  "era23-sustained-product-evolution-v1",
  "era25-pure-operational-mode-terminus-v1",
  "era24-engineering-path-terminus-v1",
  MAINTENANCE_MODE_PHASES_ERA24_POLICY_ID,
  MAINTENANCE_MODE_UI_ERA24_POLICY_ID,
  "era24-maintenance-mode-post-product-evolution-orchestrator-v1",
] as const;

export const MAINTENANCE_MODE_ERA24_OPS_SCRIPTS = [
  "ops:run-maintenance-mode-post-product-evolution-orchestrator",
  "ops:validate-maintenance-mode",
  "ops:sync-maintenance-mode-playbook-report",
  "ops:export-maintenance-mode-rhythm-calendar",
] as const;

export const MAINTENANCE_MODE_ERA24_CI_SCRIPTS = [
  "test:ci:maintenance-mode-era24",
  "test:ci:maintenance-mode-era24:cert",
] as const;

export const MAINTENANCE_MODE_ERA24_UNIT_TESTS = [
  "tests/unit/maintenance-mode-post-product-evolution-orchestrator-era24.test.ts",
  "tests/unit/maintenance-mode-phases-era24.test.ts",
  "tests/unit/maintenance-mode-ui-era24.test.ts",
  "tests/unit/run-maintenance-mode-post-product-evolution-orchestrator.test.ts",
  "tests/unit/validate-maintenance-mode.test.ts",
  "tests/unit/maintenance-mode-era24-cert-live.test.ts",
  "tests/unit/maintenance-mode-era25-integration.test.ts",
] as const;

export const MAINTENANCE_MODE_ERA24_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
