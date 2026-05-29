/**
 * Linear chain terminus guard integrity — policy wiring.
 */

import {
  LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_POLICY_ID,
  LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/linear-chain-terminus-guard-integrity-era41";

export {
  LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_POLICY_ID,
  LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_BASELINE_ARTIFACT,
};

export const LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_OPS_SCRIPTS = [
  "ops:validate-linear-chain-terminus-guard-integrity",
  "ops:sync-linear-chain-terminus-guard-integrity-baseline",
] as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_CI_SCRIPTS = [
  "test:ci:linear-chain-terminus-guard-integrity-era41",
] as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_UNIT_TESTS = [
  "tests/unit/linear-chain-terminus-guard-integrity-era41.test.ts",
  "tests/unit/validate-linear-chain-terminus-guard-integrity.test.ts",
  "tests/unit/linear-chain-terminus-guard-integrity-era41-cert-live.test.ts",
] as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-linear-chain-terminus-guard-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
