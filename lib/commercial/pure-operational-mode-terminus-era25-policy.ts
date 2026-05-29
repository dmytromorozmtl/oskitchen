/**
 * era25 Pure Operational Mode Terminus — product slice policy.
 */
import {
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import { SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/sustained-operational-excellence-convergence-era25-policy";

/** Inline — importing from ui-era25 creates a policy → ui → ops → policy cycle at build time. */
const PURE_OPERATIONAL_MODE_TERMINUS_ERA25_UI_POLICY_ID =
  "era25-pure-operational-mode-terminus-ui-v1" as const;

export const PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POLICY_ID =
  "era25-pure-operational-mode-terminus-v1" as const;

export { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC };

export const PURE_OPERATIONAL_MODE_TERMINUS_ERA25_EXTENDS_POLICIES = [
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POLICY_ID,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PHASES_POLICY_ID,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_UI_POLICY_ID,
  "era25-pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-v1",
  "era22-continuous-improvement-loop-phases-v1",
] as const;

export const PURE_OPERATIONAL_MODE_TERMINUS_ERA25_OPS_SCRIPTS = [
  "ops:run-pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25",
  "ops:validate-pure-operational-mode-terminus-era25",
  "ops:sync-pure-operational-mode-terminus-era25-report",
  "ops:validate-sustained-operational-excellence-convergence-era25",
  "ops:validate-continuous-improvement-loop",
] as const;

export const PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CI_SCRIPTS = [
  "test:ci:pure-operational-mode-terminus-era25",
  "test:ci:pure-operational-mode-terminus-era25:cert",
] as const;

export const PURE_OPERATIONAL_MODE_TERMINUS_ERA25_UNIT_TESTS = [
  "tests/unit/pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25.test.ts",
  "tests/unit/pure-operational-mode-terminus-phases-era25.test.ts",
  "tests/unit/pure-operational-mode-terminus-ui-era25.test.ts",
  "tests/unit/load-pure-operational-mode-terminus-state-era25.test.ts",
  "tests/unit/run-pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25.test.ts",
  "tests/unit/validate-pure-operational-mode-terminus-era25.test.ts",
  "tests/unit/evaluate-pure-operational-mode-terminus-era25.test.ts",
  "tests/unit/pure-operational-mode-terminus-era25-gate-suppression.test.ts",
  "tests/unit/pure-operational-mode-terminus-era25-steady-state-stack-era25.test.ts",
  "tests/unit/pure-operational-mode-terminus-era25-cert-live.test.ts",
] as const;

export const PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-breakthrough-era25-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "app/dashboard/today/page.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-view.tsx",
  "components/dashboard/launch-wizard/launch-wizard-commercial-blockers-panel.tsx",
] as const;
