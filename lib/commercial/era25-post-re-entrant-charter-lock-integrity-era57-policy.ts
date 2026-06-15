/**
 * Era25 post-re-entrant charter lock integrity — policy wiring.
 */

import {
  ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_POLICY_ID,
  ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-post-re-entrant-charter-lock-integrity-era57";

export {
  ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_POLICY_ID,
  ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_OPS_SCRIPTS = [
  "ops:validate-era25-post-re-entrant-charter-lock-integrity",
  "ops:sync-era25-post-re-entrant-charter-lock-integrity-baseline",
] as const;

export const ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_CI_SCRIPTS = [
  "test:ci:era25-post-re-entrant-charter-lock-integrity-era57",
  "test:ci:era25-post-re-entrant-charter-lock-integrity-era57:cert",
] as const;

export const ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_GOVERNANCE_BUNDLES_CERT_CHAIN = [
  "test:ci:era25-post-re-entrant-charter-lock-integrity-era57:cert",
] as const;

export const ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_UNIT_TESTS = [
  "tests/unit/era25-post-re-entrant-charter-lock-integrity-era57.test.ts",
  "tests/unit/validate-era25-post-re-entrant-charter-lock-integrity.test.ts",
  "tests/unit/era25-post-re-entrant-charter-lock-integrity-era57-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-post-re-entrant-charter-lock-era57.test.ts",
  "tests/unit/owner-daily-briefing-era25-post-re-entrant-charter-lock-era57.test.ts",
] as const;

export const ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-post-re-entrant-charter-lock-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
