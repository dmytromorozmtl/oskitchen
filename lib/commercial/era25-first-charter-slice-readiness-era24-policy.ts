/**
 * era25 first charter slice readiness — outside linear catalog policy.
 */
import {
  ERA25_FIRST_CHARTER_SLICE_READINESS_PHASES_ERA24_POLICY_ID,
  ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC,
} from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";
import { ERA25_FIRST_CHARTER_SLICE_READINESS_UI_ERA24_POLICY_ID } from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";
import { ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_POLICY_ID } from "@/lib/commercial/era25-charter-exit-outside-linear-path-era24-policy";

export const ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_POLICY_ID =
  "era24-era25-first-charter-slice-readiness-v1" as const;

export { ERA25_FIRST_CHARTER_SLICE_TEMPLATE_DOC };

export const ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_BACKLOG_ID =
  "KOS-E25-SLICE-READINESS" as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_EXTENDS_POLICIES = [
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_POLICY_ID,
  ERA25_FIRST_CHARTER_SLICE_READINESS_PHASES_ERA24_POLICY_ID,
  ERA25_FIRST_CHARTER_SLICE_READINESS_UI_ERA24_POLICY_ID,
  "era24-era25-first-charter-slice-readiness-post-charter-exit-orchestrator-v1",
] as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_OPS_SCRIPTS = [
  "ops:run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator",
  "ops:validate-era25-first-charter-slice-readiness",
  "ops:sync-era25-first-charter-slice-readiness-report",
  "ops:validate-era25-charter-exit-outside-linear-path",
] as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_CI_SCRIPTS = [
  "test:ci:era25-first-charter-slice-readiness-era24",
  "test:ci:era25-first-charter-slice-readiness-era24:cert",
] as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_UNIT_TESTS = [
  "tests/unit/era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24.test.ts",
  "tests/unit/era25-first-charter-slice-readiness-phases-era24.test.ts",
  "tests/unit/era25-first-charter-slice-readiness-ui-era24.test.ts",
  "tests/unit/run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator.test.ts",
  "tests/unit/validate-era25-first-charter-slice-readiness.test.ts",
  "tests/unit/validate-era25-charter-doc-sections-era24.test.ts",
  "tests/unit/evaluate-era25-first-charter-slice-readiness.test.ts",
  "tests/unit/era25-first-charter-slice-readiness-era24-cert-live.test.ts",
] as const;

export const ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
