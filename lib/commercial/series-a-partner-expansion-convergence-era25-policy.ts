/**
 * era25 Series A / Partner Expansion Convergence — product slice policy.
 */
import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";
/** Inline — avoids policy → ui → ops → policy TDZ at build time. */
const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_UI_POLICY_ID = "era25-series-a-partner-expansion-convergence-ui-v1" as const;
import { SCALE_READINESS_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/scale-readiness-convergence-era25-policy";

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POLICY_ID =
  "era25-series-a-partner-expansion-convergence-v1" as const;

export { SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC };

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_EXTENDS_POLICIES = [
  SCALE_READINESS_CONVERGENCE_ERA25_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PHASES_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_UI_POLICY_ID,
  "era25-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-v1",
  "era25-series-a-partner-expansion-convergence-briefing-v1",
  "era21-series-a-partner-expansion-phases-v1",
] as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_OPS_SCRIPTS = [
  "ops:run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25",
  "ops:validate-series-a-partner-expansion-convergence-era25",
  "ops:sync-series-a-partner-expansion-convergence-era25-report",
  "ops:validate-scale-readiness-convergence-era25",
  "ops:validate-series-a-partner-expansion-env",
] as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CI_SCRIPTS = [
  "test:ci:series-a-partner-expansion-convergence-era25",
  "test:ci:series-a-partner-expansion-convergence-era25:cert",
] as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_UNIT_TESTS = [
  "tests/unit/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25.test.ts",
  "tests/unit/series-a-partner-expansion-convergence-phases-era25.test.ts",
  "tests/unit/series-a-partner-expansion-convergence-ui-era25.test.ts",
  "tests/unit/series-a-partner-expansion-convergence-briefing-era25.test.ts",
  "tests/unit/load-series-a-partner-expansion-convergence-state-era25.test.ts",
  "tests/unit/run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25.test.ts",
  "tests/unit/validate-series-a-partner-expansion-convergence-era25.test.ts",
  "tests/unit/evaluate-series-a-partner-expansion-convergence-era25.test.ts",
  "tests/unit/series-a-partner-expansion-convergence-era25-cert-live.test.ts",
] as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-breakthrough-era25-panel.tsx",
  "components/dashboard/launch-wizard/series-a-partner-expansion-convergence-era25-strip.tsx",
  "app/dashboard/today/page.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
