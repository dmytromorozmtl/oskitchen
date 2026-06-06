/**
 * Era 198 — CRM Automation wiring cert (Phase 7 Round 2 #50).
 *
 * Full path: win-back → birthday → favorites reorder automation.
 */

import {
  CRM_AUTOMATION_ERA123_OPS_DOC,
  CRM_AUTOMATION_ERA123_POLICY_ID,
  CRM_AUTOMATION_ERA123_ROUTE,
  CRM_AUTOMATION_ERA123_SERVICE,
  CRM_AUTOMATION_ERA123_SUMMARY_ARTIFACT,
  CRM_AUTOMATION_ERA123_TRIGGERS,
  CRM_AUTOMATION_ERA123_WIRING_PATHS,
} from "@/lib/crm/crm-automation-era123-policy";

export const CRM_AUTOMATION_ERA198_POLICY_ID = "era198-crm-automation-v1" as const;

export const CRM_AUTOMATION_ERA198_SUMMARY_ARTIFACT =
  "artifacts/crm-automation-era198-smoke-summary.json" as const;

export const CRM_AUTOMATION_ERA198_NPM_SCRIPT = "smoke:crm-automation-era198" as const;

export const CRM_AUTOMATION_ERA198_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-crm-automation-era198.ts" as const;

export const CRM_AUTOMATION_ERA198_OPS_DOC = "docs/crm-automation-era198-setup.md" as const;

export const CRM_AUTOMATION_ERA198_CANONICAL_OPS_DOC = CRM_AUTOMATION_ERA123_OPS_DOC;

export const CRM_AUTOMATION_ERA198_CANONICAL_SUMMARY_ARTIFACT =
  CRM_AUTOMATION_ERA123_SUMMARY_ARTIFACT;

export const CRM_AUTOMATION_ERA198_WIRING_PATHS = CRM_AUTOMATION_ERA123_WIRING_PATHS;

export const CRM_AUTOMATION_ERA198_SERVICE = CRM_AUTOMATION_ERA123_SERVICE;

export const CRM_AUTOMATION_ERA198_ROUTE = CRM_AUTOMATION_ERA123_ROUTE;

export const CRM_AUTOMATION_ERA198_TRIGGERS = CRM_AUTOMATION_ERA123_TRIGGERS;

export const CRM_AUTOMATION_ERA198_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → CRM → Automation.",
  "Review summary — pending, win-back, birthdays, favorites reorder nudges.",
  "Inspect automation lanes and candidate queue per trigger type.",
  "Save settings and run scan — follow-ups created, birthday rewards awarded.",
  "Run npm run smoke:crm-automation-era123 — canonical era123 wiring cert PASSED.",
  "Run npm run smoke:crm-automation-era198 — artifact overall PASSED.",
] as const;

export const CRM_AUTOMATION_ERA198_CI_SCRIPTS = [
  "test:ci:crm-automation-era198",
  "test:ci:crm-automation-era198:cert",
] as const;

export const CRM_AUTOMATION_ERA198_UNIT_TESTS = [
  "tests/unit/crm-automation-era198.test.ts",
  "tests/unit/crm-automation-era123.test.ts",
  "tests/unit/crm-automation.test.ts",
] as const;

export const CRM_AUTOMATION_ERA198_CANONICAL_POLICY_ID = CRM_AUTOMATION_ERA123_POLICY_ID;
