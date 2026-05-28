/**
 * Linear path permanently closed — Era 24 Step 16 terminal closure policy.
 */

import {
  LINEAR_PATH_PERMANENTLY_CLOSED_PHASES_ERA24_POLICY_ID,
  LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import { LINEAR_PATH_PERMANENTLY_CLOSED_UI_ERA24_POLICY_ID } from "@/lib/commercial/linear-path-permanently-closed-ui-era24";
import { COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_POLICY_ID } from "@/lib/commercial/commercial-pilot-path-absolute-end-era24-policy";

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_POLICY_ID =
  "era24-linear-path-permanently-closed-v1" as const;

export { LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC };

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_BACKLOG_ID = "KOS-E24-016" as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_EXTENDS_POLICIES = [
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_POLICY_ID,
  LINEAR_PATH_PERMANENTLY_CLOSED_PHASES_ERA24_POLICY_ID,
  LINEAR_PATH_PERMANENTLY_CLOSED_UI_ERA24_POLICY_ID,
] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_OPS_SCRIPTS = [
  "ops:validate-linear-path-permanently-closed",
  "ops:sync-linear-path-permanently-closed-report",
  "ops:validate-linear-chain-terminus-guard",
] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_CI_SCRIPTS = [
  "test:ci:linear-path-permanently-closed-era24",
  "test:ci:linear-path-permanently-closed-era24:cert",
] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_UNIT_TESTS = [
  "tests/unit/linear-path-permanently-closed-phases-era24.test.ts",
  "tests/unit/linear-path-permanently-closed-ui-era24.test.ts",
  "tests/unit/validate-linear-path-permanently-closed.test.ts",
  "tests/unit/linear-chain-terminus-guard-era24.test.ts",
  "tests/unit/validate-linear-chain-terminus-guard.test.ts",
  "tests/unit/linear-path-permanently-closed-era24-cert-live.test.ts",
] as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
