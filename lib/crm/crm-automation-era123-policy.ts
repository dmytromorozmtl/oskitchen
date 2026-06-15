/**
 * Era 123 — CRM Automation wiring cert (Phase 7 #50).
 *
 * Full path: win-back → birthday → favorites reorder automation.
 */

import {
  CRM_AUTOMATION_PATH,
  CRM_AUTOMATION_POLICY_ID,
  CRM_AUTOMATION_SERVICE,
} from "@/lib/crm/automation-policy";

export const CRM_AUTOMATION_ERA123_POLICY_ID = "era123-crm-automation-v1" as const;

export const CRM_AUTOMATION_ERA123_SUMMARY_ARTIFACT =
  "artifacts/crm-automation-smoke-summary.json" as const;

export const CRM_AUTOMATION_ERA123_NPM_SCRIPT = "smoke:crm-automation-era123" as const;

export const CRM_AUTOMATION_ERA123_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-crm-automation-era123.ts" as const;

export const CRM_AUTOMATION_ERA123_OPS_DOC = "docs/crm-automation-era123-setup.md" as const;

export const CRM_AUTOMATION_ERA123_WIRING_PATHS = [
  CRM_AUTOMATION_SERVICE,
  "lib/crm/automation-builders.ts",
  "lib/crm/automation-policy.ts",
  "app/dashboard/crm/automation/page.tsx",
  "components/crm/crm-automation-panel.tsx",
  "actions/crm/automation.ts",
] as const;

export const CRM_AUTOMATION_ERA123_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → CRM → Automation.",
  "Review summary — pending, win-back, birthdays, favorites reorder nudges.",
  "Inspect automation lanes and candidate queue per trigger type.",
  "Save settings and run scan — follow-ups created, birthday rewards awarded.",
  "Run npm run smoke:crm-automation-era123 — artifact overall PASSED.",
] as const;

export const CRM_AUTOMATION_ERA123_CI_SCRIPTS = [
  "test:ci:crm-automation-era123",
  "test:ci:crm-automation-era123:cert",
] as const;

export const CRM_AUTOMATION_ERA123_UNIT_TESTS = [
  "tests/unit/crm-automation-era123.test.ts",
  "tests/unit/crm-automation.test.ts",
] as const;

export const CRM_AUTOMATION_ERA123_CANONICAL_POLICY_ID = CRM_AUTOMATION_POLICY_ID;

export const CRM_AUTOMATION_ERA123_SERVICE = CRM_AUTOMATION_SERVICE;

export const CRM_AUTOMATION_ERA123_ROUTE = CRM_AUTOMATION_PATH;

export const CRM_AUTOMATION_ERA123_TRIGGERS = [
  "win-back",
  "birthday",
  "favorites",
] as const;
