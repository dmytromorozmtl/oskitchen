/**
 * Era 190 — Virtual Brand Manager wiring cert (Phase 5 Round 2 #42).
 *
 * Full path: template → provision → starter menu → storefront → launch checklist.
 */

import {
  VIRTUAL_BRAND_MANAGER_ERA115_OPS_DOC,
  VIRTUAL_BRAND_MANAGER_ERA115_POLICY_ID,
  VIRTUAL_BRAND_MANAGER_ERA115_PROVISION_TARGET_MINUTES,
  VIRTUAL_BRAND_MANAGER_ERA115_ROUTE,
  VIRTUAL_BRAND_MANAGER_ERA115_SERVICE,
  VIRTUAL_BRAND_MANAGER_ERA115_SUMMARY_ARTIFACT,
  VIRTUAL_BRAND_MANAGER_ERA115_TEMPLATES,
  VIRTUAL_BRAND_MANAGER_ERA115_WIRING_PATHS,
} from "@/lib/enterprise/virtual-brand-manager-era115-policy";

export const VIRTUAL_BRAND_MANAGER_ERA190_POLICY_ID =
  "era190-virtual-brand-manager-v1" as const;

export const VIRTUAL_BRAND_MANAGER_ERA190_SUMMARY_ARTIFACT =
  "artifacts/virtual-brand-manager-era190-smoke-summary.json" as const;

export const VIRTUAL_BRAND_MANAGER_ERA190_NPM_SCRIPT =
  "smoke:virtual-brand-manager-era190" as const;

export const VIRTUAL_BRAND_MANAGER_ERA190_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-virtual-brand-manager-era190.ts" as const;

export const VIRTUAL_BRAND_MANAGER_ERA190_OPS_DOC =
  "docs/virtual-brand-manager-era190-setup.md" as const;

export const VIRTUAL_BRAND_MANAGER_ERA190_CANONICAL_OPS_DOC =
  VIRTUAL_BRAND_MANAGER_ERA115_OPS_DOC;

export const VIRTUAL_BRAND_MANAGER_ERA190_CANONICAL_SUMMARY_ARTIFACT =
  VIRTUAL_BRAND_MANAGER_ERA115_SUMMARY_ARTIFACT;

export const VIRTUAL_BRAND_MANAGER_ERA190_WIRING_PATHS =
  VIRTUAL_BRAND_MANAGER_ERA115_WIRING_PATHS;

export const VIRTUAL_BRAND_MANAGER_ERA190_SERVICE =
  VIRTUAL_BRAND_MANAGER_ERA115_SERVICE;

export const VIRTUAL_BRAND_MANAGER_ERA190_ROUTE =
  VIRTUAL_BRAND_MANAGER_ERA115_ROUTE;

export const VIRTUAL_BRAND_MANAGER_ERA190_PROVISION_TARGET_MINUTES =
  VIRTUAL_BRAND_MANAGER_ERA115_PROVISION_TARGET_MINUTES;

export const VIRTUAL_BRAND_MANAGER_ERA190_TEMPLATES =
  VIRTUAL_BRAND_MANAGER_ERA115_TEMPLATES;

export const VIRTUAL_BRAND_MANAGER_ERA190_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → Virtual Brand Manager.",
  "Pick a template — ghost kitchen, cloud kitchen, meal prep, or catering.",
  "Enter brand name and optional menu clone source.",
  "Provision brand — verify starter menu and storefront link created.",
  "Run npm run smoke:virtual-brand-manager-era115 — canonical era115 wiring cert PASSED.",
  "Run npm run smoke:virtual-brand-manager-era190 — artifact overall PASSED.",
] as const;

export const VIRTUAL_BRAND_MANAGER_ERA190_CI_SCRIPTS = [
  "test:ci:virtual-brand-manager-era190",
  "test:ci:virtual-brand-manager-era190:cert",
] as const;

export const VIRTUAL_BRAND_MANAGER_ERA190_UNIT_TESTS = [
  "tests/unit/virtual-brand-manager-era190.test.ts",
  "tests/unit/virtual-brand-manager-era115.test.ts",
  "tests/unit/virtual-brand-manager.test.ts",
] as const;

export const VIRTUAL_BRAND_MANAGER_ERA190_CANONICAL_POLICY_ID =
  VIRTUAL_BRAND_MANAGER_ERA115_POLICY_ID;
