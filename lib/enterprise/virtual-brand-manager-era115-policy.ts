/**
 * Era 115 — Virtual Brand Manager wiring cert (Phase 5 extension #115).
 *
 * Full path: template → provision → starter menu → storefront → launch checklist.
 */

import { VIRTUAL_BRAND_POLICY_ID } from "@/lib/enterprise/virtual-brand-policy";

export const VIRTUAL_BRAND_MANAGER_ERA115_POLICY_ID =
  "era115-virtual-brand-manager-v1" as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_SUMMARY_ARTIFACT =
  "artifacts/virtual-brand-manager-smoke-summary.json" as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_NPM_SCRIPT =
  "smoke:virtual-brand-manager-era115" as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-virtual-brand-manager-era115.ts" as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_OPS_DOC =
  "docs/virtual-brand-manager-era115-setup.md" as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_WIRING_PATHS = [
  "services/enterprise/virtual-brand-service.ts",
  "lib/enterprise/virtual-brand-builders.ts",
  "lib/enterprise/virtual-brand-policy.ts",
  "actions/virtual-brand.ts",
  "app/dashboard/enterprise/virtual-brand/page.tsx",
  "components/enterprise/virtual-brand-manager-panel.tsx",
] as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → Virtual Brand Manager.",
  "Pick a template — ghost kitchen, cloud kitchen, meal prep, or catering.",
  "Enter brand name and optional menu clone source.",
  "Provision brand — verify starter menu and storefront link created.",
  "Run npm run smoke:virtual-brand-manager-era115 — artifact overall PASSED.",
] as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_CI_SCRIPTS = [
  "test:ci:virtual-brand-manager-era115",
  "test:ci:virtual-brand-manager-era115:cert",
] as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_UNIT_TESTS = [
  "tests/unit/virtual-brand-manager-era115.test.ts",
  "tests/unit/virtual-brand-manager.test.ts",
] as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_CANONICAL_POLICY_ID = VIRTUAL_BRAND_POLICY_ID;

export const VIRTUAL_BRAND_MANAGER_ERA115_SERVICE =
  "services/enterprise/virtual-brand-service.ts" as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_ROUTE =
  "/dashboard/enterprise/virtual-brand" as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_PROVISION_TARGET_MINUTES = 5 as const;

export const VIRTUAL_BRAND_MANAGER_ERA115_TEMPLATES = [
  "ghost_kitchen",
  "cloud_kitchen",
  "meal_prep",
  "catering",
] as const;
