/**
 * Commercial pilot path absolute end — Era 24 Step 15 closure policy.
 */

import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PHASES_ERA24_POLICY_ID,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import { COMMERCIAL_PILOT_PATH_ABSOLUTE_END_UI_ERA24_POLICY_ID } from "@/lib/commercial/commercial-pilot-path-absolute-end-ui-era24";

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_POLICY_ID =
  "era24-commercial-pilot-path-absolute-end-v1" as const;

export { COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC };

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_BACKLOG_ID = "KOS-E24-015" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_EXTENDS_POLICIES = [
  "era25-pure-operational-mode-terminus-v1",
  "era24-post-terminus-steady-state-v1",
  "era24-linear-path-permanently-closed-v1",
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_PHASES_ERA24_POLICY_ID,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_UI_ERA24_POLICY_ID,
  "era24-commercial-pilot-path-absolute-end-post-steady-state-orchestrator-v1",
] as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_OPS_SCRIPTS = [
  "ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator",
  "ops:validate-commercial-pilot-path-absolute-end",
  "ops:sync-commercial-pilot-path-absolute-end-report",
] as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_CI_SCRIPTS = [
  "test:ci:commercial-pilot-path-absolute-end-era24",
  "test:ci:commercial-pilot-path-absolute-end-era24:cert",
] as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_UNIT_TESTS = [
  "tests/unit/commercial-pilot-path-absolute-end-post-steady-state-orchestrator-era24.test.ts",
  "tests/unit/commercial-pilot-path-absolute-end-phases-era24.test.ts",
  "tests/unit/commercial-pilot-path-absolute-end-ui-era24.test.ts",
  "tests/unit/run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator.test.ts",
  "tests/unit/validate-commercial-pilot-path-absolute-end.test.ts",
  "tests/unit/commercial-pilot-path-absolute-end-era25-integration.test.ts",
  "tests/unit/commercial-pilot-path-absolute-end-era24-cert-live.test.ts",
] as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
