/**
 * era25 Scale Readiness Convergence — product slice policy.
 */
import {
  SCALE_READINESS_CONVERGENCE_ERA25_DOC,
  SCALE_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/scale-readiness-convergence-phases-era25";
import { SCALE_READINESS_CONVERGENCE_ERA25_UI_POLICY_ID } from "@/lib/commercial/scale-readiness-convergence-ui-era25";
import { MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/month2-market-readiness-convergence-era25-policy";

export const SCALE_READINESS_CONVERGENCE_ERA25_POLICY_ID =
  "era25-scale-readiness-convergence-v1" as const;

export { SCALE_READINESS_CONVERGENCE_ERA25_DOC };

export const SCALE_READINESS_CONVERGENCE_ERA25_EXTENDS_POLICIES = [
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POLICY_ID,
  SCALE_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID,
  SCALE_READINESS_CONVERGENCE_ERA25_UI_POLICY_ID,
  "era25-scale-readiness-convergence-post-month2-convergence-orchestrator-v1",
  "era25-scale-readiness-convergence-briefing-v1",
  "era21-scale-readiness-phases-v1",
] as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_OPS_SCRIPTS = [
  "ops:run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25",
  "ops:validate-scale-readiness-convergence-era25",
  "ops:sync-scale-readiness-convergence-era25-report",
  "ops:validate-month2-market-readiness-convergence-era25",
  "ops:validate-scale-readiness-env",
] as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_CI_SCRIPTS = [
  "test:ci:scale-readiness-convergence-era25",
  "test:ci:scale-readiness-convergence-era25:cert",
] as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_UNIT_TESTS = [
  "tests/unit/scale-readiness-convergence-post-month2-convergence-orchestrator-era25.test.ts",
  "tests/unit/scale-readiness-convergence-phases-era25.test.ts",
  "tests/unit/scale-readiness-convergence-ui-era25.test.ts",
  "tests/unit/scale-readiness-convergence-briefing-era25.test.ts",
  "tests/unit/load-scale-readiness-convergence-state-era25.test.ts",
  "tests/unit/run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25.test.ts",
  "tests/unit/validate-scale-readiness-convergence-era25.test.ts",
  "tests/unit/evaluate-scale-readiness-convergence-era25.test.ts",
  "tests/unit/scale-readiness-convergence-era25-cert-live.test.ts",
] as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-breakthrough-era25-panel.tsx",
  "components/dashboard/launch-wizard/scale-readiness-convergence-era25-strip.tsx",
  "app/dashboard/today/page.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
