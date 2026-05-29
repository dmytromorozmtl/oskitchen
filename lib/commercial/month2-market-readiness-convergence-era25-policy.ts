/**
 * era25 Month 2 Market Readiness Convergence — product slice policy.
 */
import {
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";
import { MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_UI_POLICY_ID } from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";
import { PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/pilot-week1-execution-convergence-era25-policy";

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POLICY_ID =
  "era25-month2-market-readiness-convergence-v1" as const;

export { MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC };

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_EXTENDS_POLICIES = [
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POLICY_ID,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_UI_POLICY_ID,
  "era25-month2-market-readiness-convergence-post-week1-convergence-orchestrator-v1",
  "era25-month2-market-readiness-convergence-briefing-v1",
  "era21-month2-market-readiness-phases-v1",
] as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_OPS_SCRIPTS = [
  "ops:run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25",
  "ops:validate-month2-market-readiness-convergence-era25",
  "ops:sync-month2-market-readiness-convergence-era25-report",
  "ops:validate-pilot-week1-execution-convergence-era25",
  "ops:validate-month2-market-readiness-env",
] as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CI_SCRIPTS = [
  "test:ci:month2-market-readiness-convergence-era25",
  "test:ci:month2-market-readiness-convergence-era25:cert",
] as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_UNIT_TESTS = [
  "tests/unit/month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25.test.ts",
  "tests/unit/month2-market-readiness-convergence-phases-era25.test.ts",
  "tests/unit/month2-market-readiness-convergence-ui-era25.test.ts",
  "tests/unit/month2-market-readiness-convergence-briefing-era25.test.ts",
  "tests/unit/load-month2-market-readiness-convergence-state-era25.test.ts",
  "tests/unit/run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25.test.ts",
  "tests/unit/validate-month2-market-readiness-convergence-era25.test.ts",
  "tests/unit/evaluate-month2-market-readiness-convergence-era25.test.ts",
  "tests/unit/month2-market-readiness-convergence-era25-cert-live.test.ts",
] as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-breakthrough-era25-panel.tsx",
  "components/dashboard/launch-wizard/month2-market-readiness-convergence-era25-strip.tsx",
  "app/dashboard/today/page.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
