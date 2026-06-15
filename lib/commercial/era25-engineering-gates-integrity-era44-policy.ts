/**
 * Era25 engineering gates integrity — policy wiring.
 */

import {
  ERA25_ENGINEERING_GATES_INTEGRITY_ERA44_POLICY_ID,
  ERA25_ENGINEERING_GATES_INTEGRITY_BASELINE_ARTIFACT,
} from "@/lib/commercial/era25-engineering-gates-integrity-era44";

export {
  ERA25_ENGINEERING_GATES_INTEGRITY_ERA44_POLICY_ID,
  ERA25_ENGINEERING_GATES_INTEGRITY_BASELINE_ARTIFACT,
};

export const ERA25_ENGINEERING_GATES_INTEGRITY_ERA44_OPS_SCRIPTS = [
  "ops:validate-era25-engineering-gates-integrity",
  "ops:sync-era25-engineering-gates-integrity-baseline",
] as const;

export const ERA25_ENGINEERING_GATES_INTEGRITY_ERA44_CI_SCRIPTS = [
  "test:ci:era25-engineering-gates-integrity-era44",
] as const;

export const ERA25_ENGINEERING_GATES_INTEGRITY_ERA44_UNIT_TESTS = [
  "tests/unit/era25-engineering-gates-integrity-era44.test.ts",
  "tests/unit/validate-era25-engineering-gates-integrity.test.ts",
  "tests/unit/era25-engineering-gates-integrity-era44-cert-live.test.ts",
  "tests/unit/launch-wizard-era25-engineering-gates-era44.test.ts",
  "tests/unit/owner-daily-briefing-era25-engineering-gates-era44.test.ts",
] as const;

export const ERA25_ENGINEERING_GATES_INTEGRITY_ERA44_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-era25-engineering-gates-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
