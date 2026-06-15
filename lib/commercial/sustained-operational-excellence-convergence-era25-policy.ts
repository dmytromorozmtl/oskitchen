/**
 * era25 Sustained Operational Excellence Convergence — product slice policy.
 */
import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/sustained-operational-excellence-convergence-phases-era25";
/** Inline — avoids policy → ui → ops → policy TDZ at build time. */
const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_UI_POLICY_ID = "era25-sustained-operational-excellence-convergence-ui-v1" as const;
import { MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/market-leader-positioning-convergence-era25-policy";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POLICY_ID =
  "era25-sustained-operational-excellence-convergence-v1" as const;

export { SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC };

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_EXTENDS_POLICIES = [
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PHASES_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_UI_POLICY_ID,
  "era25-sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-v1",
  "era25-sustained-operational-excellence-convergence-briefing-v1",
  "era21-sustained-operational-excellence-phases-v1",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_OPS_SCRIPTS = [
  "ops:run-sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25",
  "ops:validate-sustained-operational-excellence-convergence-era25",
  "ops:sync-sustained-operational-excellence-convergence-era25-report",
  "ops:validate-market-leader-positioning-convergence-era25",
  "ops:validate-sustained-operational-excellence-env",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CI_SCRIPTS = [
  "test:ci:sustained-operational-excellence-convergence-era25",
  "test:ci:sustained-operational-excellence-convergence-era25:cert",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_UNIT_TESTS = [
  "tests/unit/sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25.test.ts",
  "tests/unit/sustained-operational-excellence-convergence-phases-era25.test.ts",
  "tests/unit/sustained-operational-excellence-convergence-ui-era25.test.ts",
  "tests/unit/sustained-operational-excellence-convergence-briefing-era25.test.ts",
  "tests/unit/load-sustained-operational-excellence-convergence-state-era25.test.ts",
  "tests/unit/run-sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25.test.ts",
  "tests/unit/validate-sustained-operational-excellence-convergence-era25.test.ts",
  "tests/unit/evaluate-sustained-operational-excellence-convergence-era25.test.ts",
  "tests/unit/sustained-operational-excellence-convergence-era25-cert-live.test.ts",
] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-breakthrough-era25-panel.tsx",
  "components/dashboard/launch-wizard/sustained-operational-excellence-convergence-era25-strip.tsx",
  "app/dashboard/today/page.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
