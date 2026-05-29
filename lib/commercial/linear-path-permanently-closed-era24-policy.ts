/**
 * Linear path permanently closed — Era 24 Step 16 terminal closure policy.
 */

import {
  LINEAR_PATH_PERMANENTLY_CLOSED_PHASES_ERA24_POLICY_ID,
  LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_POLICY_ID =
  "era24-linear-path-permanently-closed-v1" as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_UI_ERA24_POLICY_ID =
  "era24-linear-path-permanently-closed-ui-v1" as const;

export { LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC };

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_BACKLOG_ID = "KOS-E24-016" as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_EXTENDS_POLICIES = [
  "era24-commercial-pilot-path-absolute-end-v1",
  LINEAR_PATH_PERMANENTLY_CLOSED_PHASES_ERA24_POLICY_ID,
  LINEAR_PATH_PERMANENTLY_CLOSED_UI_ERA24_POLICY_ID,
  "era24-linear-path-permanently-closed-post-absolute-end-orchestrator-v1",
] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_OPS_SCRIPTS = [
  "ops:run-linear-path-permanently-closed-post-absolute-end-orchestrator",
  "ops:validate-linear-path-permanently-closed",
  "ops:sync-linear-path-permanently-closed-report",
  "ops:validate-linear-chain-terminus-guard",
  "ops:validate-linear-path-permanently-closed-integrity",
  "ops:sync-linear-path-permanently-closed-integrity-baseline",
] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_CI_SCRIPTS = [
  "test:ci:linear-path-permanently-closed-era24",
  "test:ci:linear-path-permanently-closed-era24:cert",
  "test:ci:linear-path-permanently-closed-integrity-era40",
] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_UNIT_TESTS = [
  "tests/unit/linear-path-permanently-closed-post-absolute-end-orchestrator-era24.test.ts",
  "tests/unit/linear-path-permanently-closed-phases-era24.test.ts",
  "tests/unit/linear-path-permanently-closed-ui-era24.test.ts",
  "tests/unit/run-linear-path-permanently-closed-post-absolute-end-orchestrator.test.ts",
  "tests/unit/validate-linear-path-permanently-closed.test.ts",
  "tests/unit/linear-chain-terminus-guard-era24.test.ts",
  "tests/unit/validate-linear-chain-terminus-guard.test.ts",
  "tests/unit/linear-path-permanently-closed-era24-cert-live.test.ts",
] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-linear-path-permanently-closed-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
