/**
 * era25 Pilot Week 1 Execution Convergence — product slice policy.
 */
import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/pilot-week1-execution-convergence-phases-era25";
/** Inline — avoids policy → ui → ops → policy TDZ at build time. */
const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_UI_POLICY_ID = "era25-pilot-week1-execution-convergence-ui-v1" as const;
import { PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_POLICY_ID } from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48-policy";
import { PAID_PILOT_GO_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/paid-pilot-go-convergence-era25-policy";

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POLICY_ID =
  "era25-pilot-week1-execution-convergence-v1" as const;

export { PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC };

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_EXTENDS_POLICIES = [
  PAID_PILOT_GO_CONVERGENCE_ERA25_POLICY_ID,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PHASES_POLICY_ID,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_UI_POLICY_ID,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_POLICY_ID,
  "era25-pilot-week1-execution-convergence-post-go-convergence-orchestrator-v1",
  "era25-pilot-week1-execution-convergence-briefing-v1",
  "era48-launch-wizard-era25-pilot-week1-execution-convergence-v1",
  "era48-owner-daily-briefing-era25-pilot-week1-execution-convergence-v1",
  "era21-pilot-week1-execution-phases-v1",
] as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_OPS_SCRIPTS = [
  "ops:run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25",
  "ops:validate-pilot-week1-execution-convergence-era25",
  "ops:sync-pilot-week1-execution-convergence-era25-report",
  "ops:validate-paid-pilot-go-convergence-era25",
  "ops:validate-pilot-week1-env",
  "ops:validate-pilot-week1-execution-convergence-integrity",
  "ops:sync-pilot-week1-execution-convergence-integrity-baseline",
] as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CI_SCRIPTS = [
  "test:ci:pilot-week1-execution-convergence-era25",
  "test:ci:pilot-week1-execution-convergence-era25:cert",
  "test:ci:pilot-week1-execution-convergence-integrity-era48",
] as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_UNIT_TESTS = [
  "tests/unit/pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25.test.ts",
  "tests/unit/pilot-week1-execution-convergence-phases-era25.test.ts",
  "tests/unit/pilot-week1-execution-convergence-ui-era25.test.ts",
  "tests/unit/pilot-week1-execution-convergence-briefing-era25.test.ts",
  "tests/unit/load-pilot-week1-execution-convergence-state-era25.test.ts",
  "tests/unit/run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25.test.ts",
  "tests/unit/validate-pilot-week1-execution-convergence-era25.test.ts",
  "tests/unit/evaluate-pilot-week1-execution-convergence-era25.test.ts",
  "tests/unit/pilot-week1-execution-convergence-era25-cert-live.test.ts",
  "tests/unit/pilot-week1-execution-convergence-integrity-era48.test.ts",
  "tests/unit/validate-pilot-week1-execution-convergence-integrity.test.ts",
  "tests/unit/pilot-week1-execution-convergence-integrity-era48-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-pilot-week1-execution-convergence-era48.test.ts",
  "tests/unit/owner-daily-briefing-era25-pilot-week1-execution-convergence-era48.test.ts",
] as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-breakthrough-era25-panel.tsx",
  "components/dashboard/launch-wizard/pilot-week1-execution-convergence-era25-strip.tsx",
  "components/dashboard/launch-wizard/launch-wizard-era25-pilot-week1-execution-convergence-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-view.tsx",
  "components/dashboard/launch-wizard/launch-wizard-today-strip.tsx",
  "app/dashboard/today/page.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
  "services/briefing/owner-daily-briefing-service.ts",
] as const;
