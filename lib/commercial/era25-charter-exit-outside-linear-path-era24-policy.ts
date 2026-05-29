/**
 * era25 charter exit — outside linear catalog policy (era24 process slice).
 */
import {
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_PHASES_ERA24_POLICY_ID,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";
/** Inline — avoids policy → ui → ops → policy TDZ at build time. */
const ERA25_CHARTER_EXIT_UI_ERA24_POLICY_ID = "era24-era25-charter-exit-outside-linear-path-ui-v1" as const;
import { LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID } from "@/lib/commercial/linear-chain-terminus-guard-era24-policy";

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_POLICY_ID =
  "era24-era25-charter-exit-outside-linear-path-v1" as const;

export { ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_DOC };

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_BACKLOG_ID =
  "KOS-E25-EXIT-PROCESS" as const;

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_EXTENDS_POLICIES = [
  LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_PHASES_ERA24_POLICY_ID,
  ERA25_CHARTER_EXIT_UI_ERA24_POLICY_ID,
  "era24-era25-charter-exit-post-terminus-guard-orchestrator-v1",
] as const;

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_OPS_SCRIPTS = [
  "ops:run-era25-charter-exit-post-terminus-guard-orchestrator",
  "ops:validate-era25-charter-exit-outside-linear-path",
  "ops:validate-era25-charter-exit-outside-linear-path-integrity",
  "ops:sync-era25-charter-exit-outside-linear-path-integrity-baseline",
  "ops:sync-era25-charter-exit-outside-linear-path-report",
  "ops:export-era-charter-readiness-checklist",
] as const;

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_CI_SCRIPTS = [
  "test:ci:era25-charter-exit-outside-linear-path-era24",
  "test:ci:era25-charter-exit-outside-linear-path-era24:cert",
  "test:ci:era25-charter-exit-outside-linear-path-integrity-era42",
] as const;

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_UNIT_TESTS = [
  "tests/unit/era25-charter-exit-post-terminus-guard-orchestrator-era24.test.ts",
  "tests/unit/era25-charter-exit-outside-linear-path-phases-era24.test.ts",
  "tests/unit/era25-charter-exit-ui-era24.test.ts",
  "tests/unit/run-era25-charter-exit-post-terminus-guard-orchestrator.test.ts",
  "tests/unit/validate-era25-charter-exit-outside-linear-path.test.ts",
  "tests/unit/evaluate-era25-charter-exit-outside-linear-path.test.ts",
  "tests/unit/era25-charter-exit-outside-linear-path-integrity-era42.test.ts",
  "tests/unit/validate-era25-charter-exit-outside-linear-path-integrity.test.ts",
  "tests/unit/era25-charter-exit-outside-linear-path-integrity-era42-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-charter-exit-era42.test.ts",
  "tests/unit/owner-daily-briefing-era25-charter-exit-era42.test.ts",
  "tests/unit/era25-charter-exit-outside-linear-path-era24-cert-live.test.ts",
] as const;

export const ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ERA24_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-charter-exit-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
