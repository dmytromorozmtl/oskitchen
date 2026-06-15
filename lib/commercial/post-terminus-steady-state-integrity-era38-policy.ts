/**
 * Post-terminus steady state integrity — policy wiring.
 */

import {
  POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_POLICY_ID,
  POST_TERMINUS_STEADY_STATE_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/post-terminus-steady-state-integrity-era38";

export {
  POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_POLICY_ID,
  POST_TERMINUS_STEADY_STATE_INTEGRITY_BASELINE_ARTIFACT,
};

export const POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_OPS_SCRIPTS = [
  "ops:validate-post-terminus-steady-state-integrity",
  "ops:sync-post-terminus-steady-state-integrity-baseline",
] as const;

export const POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_CI_SCRIPTS = [
  "test:ci:post-terminus-steady-state-integrity-era38",
] as const;

export const POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_UNIT_TESTS = [
  "tests/unit/post-terminus-steady-state-integrity-era38.test.ts",
  "tests/unit/validate-post-terminus-steady-state-integrity.test.ts",
  "tests/unit/post-terminus-steady-state-integrity-era38-cert-live.test.ts",
] as const;

export const POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-post-terminus-steady-state-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
