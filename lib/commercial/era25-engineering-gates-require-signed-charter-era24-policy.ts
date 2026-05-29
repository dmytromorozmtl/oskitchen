/**
 * era25 engineering gates require signed charter — era24 enforcement policy.
 */
import {
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_PHASES_ERA24_POLICY_ID,
} from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";
import { ERA25_ENGINEERING_GATES_UI_ERA24_POLICY_ID } from "@/lib/commercial/era25-engineering-gates-ui-era24";
import { ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_POLICY_ID } from "@/lib/commercial/era25-first-charter-slice-readiness-era24-policy";

export const ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_POLICY_ID =
  "era24-era25-engineering-gates-require-signed-charter-v1" as const;

export { ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_DOC };

export const ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_BACKLOG_ID =
  "KOS-E25-GATES-ENFORCE" as const;

export const ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_EXTENDS_POLICIES = [
  ERA25_FIRST_CHARTER_SLICE_READINESS_ERA24_POLICY_ID,
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_PHASES_ERA24_POLICY_ID,
  ERA25_ENGINEERING_GATES_UI_ERA24_POLICY_ID,
  "era24-era25-engineering-gates-post-readiness-orchestrator-v1",
] as const;

export const ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_OPS_SCRIPTS = [
  "ops:run-era25-engineering-gates-post-readiness-orchestrator",
  "ops:validate-era25-engineering-gates-require-signed-charter",
  "ops:sync-era25-engineering-gates-require-signed-charter-report",
  "ops:validate-era25-first-charter-slice-readiness",
] as const;

export const ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_CI_SCRIPTS = [
  "test:ci:era25-engineering-gates-require-signed-charter-era24",
  "test:ci:era25-engineering-gates-require-signed-charter-era24:cert",
] as const;

export const ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_UNIT_TESTS = [
  "tests/unit/era25-engineering-gates-post-readiness-orchestrator-era24.test.ts",
  "tests/unit/era25-engineering-gates-require-signed-charter-phases-era24.test.ts",
  "tests/unit/era25-engineering-gates-ui-era24.test.ts",
  "tests/unit/run-era25-engineering-gates-post-readiness-orchestrator.test.ts",
  "tests/unit/validate-era25-engineering-gates-require-signed-charter.test.ts",
  "tests/unit/detect-illegal-era25-product-artifacts-era24.test.ts",
  "tests/unit/evaluate-era25-engineering-gates-require-signed-charter.test.ts",
  "tests/unit/era25-engineering-gates-require-signed-charter-era24-cert-live.test.ts",
] as const;

export const ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
