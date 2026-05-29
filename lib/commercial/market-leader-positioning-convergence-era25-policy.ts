/**
 * era25 Market Leader Positioning Convergence — product slice policy.
 */
import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";
import { MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_UI_POLICY_ID } from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";
import { SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/series-a-partner-expansion-convergence-era25-policy";

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POLICY_ID =
  "era25-market-leader-positioning-convergence-v1" as const;

export { MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC };

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_EXTENDS_POLICIES = [
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POLICY_ID,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PHASES_POLICY_ID,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_UI_POLICY_ID,
  "era25-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-v1",
  "era25-market-leader-positioning-convergence-briefing-v1",
  "era21-market-leader-positioning-phases-v1",
] as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_OPS_SCRIPTS = [
  "ops:run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25",
  "ops:validate-market-leader-positioning-convergence-era25",
  "ops:sync-market-leader-positioning-convergence-era25-report",
  "ops:validate-series-a-partner-expansion-convergence-era25",
  "ops:validate-market-leader-positioning-env",
] as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CI_SCRIPTS = [
  "test:ci:market-leader-positioning-convergence-era25",
  "test:ci:market-leader-positioning-convergence-era25:cert",
] as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_UNIT_TESTS = [
  "tests/unit/market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25.test.ts",
  "tests/unit/market-leader-positioning-convergence-phases-era25.test.ts",
  "tests/unit/market-leader-positioning-convergence-ui-era25.test.ts",
  "tests/unit/market-leader-positioning-convergence-briefing-era25.test.ts",
  "tests/unit/load-market-leader-positioning-convergence-state-era25.test.ts",
  "tests/unit/run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25.test.ts",
  "tests/unit/validate-market-leader-positioning-convergence-era25.test.ts",
  "tests/unit/evaluate-market-leader-positioning-convergence-era25.test.ts",
  "tests/unit/market-leader-positioning-convergence-era25-cert-live.test.ts",
] as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-breakthrough-era25-panel.tsx",
  "components/dashboard/launch-wizard/market-leader-positioning-convergence-era25-strip.tsx",
  "app/dashboard/today/page.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
