/**
 * Engineering path terminus — Era 24 Step 13 ops orchestration policy.
 */

import {
  ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID,
  ENGINEERING_PATH_TERMINUS_STEP13_DOC,
} from "@/lib/commercial/engineering-path-terminus-era24";
/** Inline — avoids policy → ui → ops → policy TDZ at build time. */
const ENGINEERING_PATH_TERMINUS_UI_ERA24_POLICY_ID = "era24-engineering-path-terminus-ui-v1" as const;
import { MAINTENANCE_MODE_ERA24_POLICY_ID } from "@/lib/commercial/maintenance-mode-era24-policy";

export { ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID, ENGINEERING_PATH_TERMINUS_STEP13_DOC };

export const ENGINEERING_PATH_TERMINUS_ERA24_BACKLOG_ID = "KOS-E24-013" as const;

export const ENGINEERING_PATH_TERMINUS_ERA24_EXTENDS_POLICIES = [
  MAINTENANCE_MODE_ERA24_POLICY_ID,
  "era25-pure-operational-mode-terminus-v1",
  "era24-post-terminus-steady-state-v1",
  ENGINEERING_PATH_TERMINUS_UI_ERA24_POLICY_ID,
  "era24-engineering-path-terminus-post-maintenance-mode-orchestrator-v1",
] as const;

export const ENGINEERING_PATH_TERMINUS_ERA24_OPS_SCRIPTS = [
  "ops:run-production-pilot-ready-closure-execution",
  "ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator",
  "ops:validate-commercial-pilot-path",
  "ops:sync-commercial-pilot-path-status-report",
] as const;

export const ENGINEERING_PATH_TERMINUS_ERA24_CI_SCRIPTS = [
  "test:ci:engineering-path-terminus-era24",
  "test:ci:engineering-path-terminus-era24:cert",
] as const;

export const ENGINEERING_PATH_TERMINUS_ERA24_UNIT_TESTS = [
  "tests/unit/engineering-path-terminus-post-maintenance-mode-orchestrator-era24.test.ts",
  "tests/unit/engineering-path-terminus-era24.test.ts",
  "tests/unit/engineering-path-terminus-ui-era24.test.ts",
  "tests/unit/run-engineering-path-terminus-post-maintenance-mode-orchestrator.test.ts",
  "tests/unit/validate-commercial-pilot-path.test.ts",
  "tests/unit/engineering-path-terminus-era24-cert-live.test.ts",
  "tests/unit/engineering-path-terminus-era25-integration.test.ts",
] as const;

export const ENGINEERING_PATH_TERMINUS_ERA24_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
