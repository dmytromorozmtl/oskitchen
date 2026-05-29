/**
 * era25 first product slice blueprint — era24 orchestration policy.
 */
import {
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PHASES_ERA24_POLICY_ID,
} from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";
import { ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_UI_ERA24_POLICY_ID } from "@/lib/commercial/era25-first-product-slice-blueprint-ui-era24";
import { ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_POLICY_ID } from "@/lib/commercial/era25-engineering-gates-require-signed-charter-era24-policy";

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_POLICY_ID =
  "era24-era25-first-product-slice-blueprint-v1" as const;

export { ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC };

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_BACKLOG_ID =
  "KOS-E25-SLICE-BLUEPRINT" as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_EXTENDS_POLICIES = [
  ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ERA24_POLICY_ID,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PHASES_ERA24_POLICY_ID,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_UI_ERA24_POLICY_ID,
  "era24-era25-first-product-slice-blueprint-post-gates-orchestrator-v1",
] as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_OPS_SCRIPTS = [
  "ops:run-era25-first-product-slice-blueprint-post-gates-orchestrator",
  "ops:validate-era25-first-product-slice-blueprint",
  "ops:sync-era25-first-product-slice-blueprint-report",
  "ops:validate-era25-engineering-gates-require-signed-charter",
] as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_CI_SCRIPTS = [
  "test:ci:era25-first-product-slice-blueprint-era24",
  "test:ci:era25-first-product-slice-blueprint-era24:cert",
] as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_UNIT_TESTS = [
  "tests/unit/era25-first-product-slice-blueprint-post-gates-orchestrator-era24.test.ts",
  "tests/unit/era25-first-product-slice-blueprint-phases-era24.test.ts",
  "tests/unit/era25-first-product-slice-blueprint-ui-era24.test.ts",
  "tests/unit/run-era25-first-product-slice-blueprint-post-gates-orchestrator.test.ts",
  "tests/unit/validate-era25-first-product-slice-blueprint.test.ts",
  "tests/unit/validate-era25-first-product-slice-staging-checklist-era24.test.ts",
  "tests/unit/evaluate-era25-first-product-slice-blueprint.test.ts",
  "tests/unit/era25-first-product-slice-blueprint-era24-cert-live.test.ts",
] as const;

export const ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
