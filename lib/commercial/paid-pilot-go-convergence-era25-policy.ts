/**
 * era25 Paid Pilot GO Convergence — product slice policy.
 */
import {
  PAID_PILOT_GO_CONVERGENCE_ERA25_DOC,
  PAID_PILOT_GO_CONVERGENCE_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";
import { PAID_PILOT_GO_CONVERGENCE_ERA25_UI_POLICY_ID } from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";
import { PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_POLICY_ID } from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47-policy";
import { OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POLICY_ID } from "@/lib/commercial/owner-daily-briefing-breakthrough-era25-policy";

export const PAID_PILOT_GO_CONVERGENCE_ERA25_POLICY_ID =
  "era25-paid-pilot-go-convergence-v1" as const;

export { PAID_PILOT_GO_CONVERGENCE_ERA25_DOC };

export const PAID_PILOT_GO_CONVERGENCE_ERA25_EXTENDS_POLICIES = [
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POLICY_ID,
  PAID_PILOT_GO_CONVERGENCE_ERA25_PHASES_POLICY_ID,
  PAID_PILOT_GO_CONVERGENCE_ERA25_UI_POLICY_ID,
  PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_POLICY_ID,
  "era25-paid-pilot-go-convergence-post-breakthrough-orchestrator-v1",
  "era25-paid-pilot-go-convergence-briefing-v1",
  "era47-launch-wizard-era25-paid-pilot-go-convergence-v1",
  "era47-owner-daily-briefing-era25-paid-pilot-go-convergence-v1",
] as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_OPS_SCRIPTS = [
  "ops:run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25",
  "ops:validate-paid-pilot-go-convergence-era25",
  "ops:sync-paid-pilot-go-convergence-era25-report",
  "ops:validate-owner-daily-briefing-breakthrough-era25",
  "ops:validate-paid-pilot-go-convergence-integrity",
  "ops:sync-paid-pilot-go-convergence-integrity-baseline",
] as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_CI_SCRIPTS = [
  "test:ci:paid-pilot-go-convergence-era25",
  "test:ci:paid-pilot-go-convergence-era25:cert",
  "test:ci:paid-pilot-go-convergence-integrity-era47",
] as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_UNIT_TESTS = [
  "tests/unit/paid-pilot-go-convergence-post-breakthrough-orchestrator-era25.test.ts",
  "tests/unit/paid-pilot-go-convergence-phases-era25.test.ts",
  "tests/unit/paid-pilot-go-convergence-ui-era25.test.ts",
  "tests/unit/paid-pilot-go-convergence-briefing-era25.test.ts",
  "tests/unit/load-paid-pilot-go-convergence-state-era25.test.ts",
  "tests/unit/run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25.test.ts",
  "tests/unit/validate-paid-pilot-go-convergence-era25.test.ts",
  "tests/unit/evaluate-paid-pilot-go-convergence-era25.test.ts",
  "tests/unit/paid-pilot-go-convergence-era25-cert-live.test.ts",
  "tests/unit/paid-pilot-go-convergence-integrity-era47.test.ts",
  "tests/unit/validate-paid-pilot-go-convergence-integrity.test.ts",
  "tests/unit/paid-pilot-go-convergence-integrity-era47-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-paid-pilot-go-convergence-era47.test.ts",
  "tests/unit/owner-daily-briefing-era25-paid-pilot-go-convergence-era47.test.ts",
] as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-breakthrough-era25-panel.tsx",
  "components/dashboard/launch-wizard/paid-pilot-go-convergence-era25-strip.tsx",
  "components/dashboard/launch-wizard/launch-wizard-era25-paid-pilot-go-convergence-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-view.tsx",
  "components/dashboard/launch-wizard/launch-wizard-today-strip.tsx",
  "app/dashboard/today/page.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
  "services/briefing/owner-daily-briefing-service.ts",
] as const;
