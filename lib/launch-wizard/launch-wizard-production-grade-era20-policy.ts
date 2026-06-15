/**
 * Launch Wizard production-grade — Era 20 Workstream E.
 */

export const LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_POLICY_ID =
  "era20-launch-wizard-production-grade-v1" as const;

export const LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_BACKLOG_ID = "KOS-E20-008" as const;

export const LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_UNIT_TESTS = [
  "tests/unit/launch-wizard-production-grade-era20.test.ts",
  "tests/unit/launch-wizard-production-grade-era20-cert-live.test.ts",
] as const;

export const LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_CI_SCRIPTS = [
  "test:ci:launch-wizard-production-grade-era20",
  "test:ci:launch-wizard-production-grade-era20:cert",
] as const;
