/**
 * Blueprint P3-60 — Lighthouse CI gate (FCP<2s, LCP<3.5s, CLS<0.1).
 *
 * @see lighthouserc.core-web-vitals.cjs
 * @see docs/lighthouse-ci-gate-p3-60.md
 */

import {
  LIGHTHOUSE_CORE_WEB_VITALS_POLICY_ID,
  LIGHTHOUSE_CWV_CLS_MAX,
  LIGHTHOUSE_CWV_CONFIG_PATH,
  LIGHTHOUSE_CWV_FCP_MAX_MS,
  LIGHTHOUSE_CWV_LCP_MAX_MS,
  LIGHTHOUSE_CWV_PATHS,
  LIGHTHOUSE_CWV_WORKFLOW_PATH,
} from "@/lib/performance/lighthouse-core-web-vitals-policy";

export const LIGHTHOUSE_CI_GATE_P3_60_POLICY_ID = "lighthouse-ci-gate-p3-60-v1" as const;

export const LIGHTHOUSE_CI_GATE_P3_60_DOC = "docs/lighthouse-ci-gate-p3-60.md" as const;

export const LIGHTHOUSE_CI_GATE_P3_60_ARTIFACT =
  "artifacts/lighthouse-ci-gate-p3-60-registry.json" as const;

export const LIGHTHOUSE_CI_GATE_P3_60_CONFIG = LIGHTHOUSE_CWV_CONFIG_PATH;

export const LIGHTHOUSE_CI_GATE_P3_60_WORKFLOW = LIGHTHOUSE_CWV_WORKFLOW_PATH;

export const LIGHTHOUSE_CI_GATE_P3_60_E2E_SPEC = "e2e/lighthouse-ci-gate-p3-60.spec.ts" as const;

export const LIGHTHOUSE_CI_GATE_P3_60_FLOW_HELPER =
  "e2e/helpers/lighthouse-ci-gate-p3-60-flow.ts" as const;

export const LIGHTHOUSE_CI_GATE_P3_60_READY_HELPER =
  "e2e/helpers/lighthouse-ci-gate-p3-60-ready.ts" as const;

export const LIGHTHOUSE_CI_GATE_P3_60_AUDIT_SCRIPT =
  "scripts/audit-lighthouse-ci-gate-p3-60.ts" as const;

export const LIGHTHOUSE_CI_GATE_P3_60_NPM_SCRIPT = "audit:lighthouse-ci-gate-p3-60" as const;

export const LIGHTHOUSE_CI_GATE_P3_60_CHECK_NPM_SCRIPT = "check:lighthouse-ci-gate-p3-60" as const;

export const LIGHTHOUSE_CI_GATE_P3_60_UNIT_TEST =
  "tests/unit/lighthouse-ci-gate-p3-60.test.ts" as const;

export const LIGHTHOUSE_CI_GATE_P3_60_UPSTREAM_TEST =
  "tests/unit/lighthouse-core-web-vitals-policy.test.ts" as const;

export const LIGHTHOUSE_CI_GATE_P3_60_UPSTREAM_POLICY_ID = LIGHTHOUSE_CORE_WEB_VITALS_POLICY_ID;

export const LIGHTHOUSE_CI_GATE_P3_60_FCP_MAX_MS = LIGHTHOUSE_CWV_FCP_MAX_MS;

export const LIGHTHOUSE_CI_GATE_P3_60_LCP_MAX_MS = LIGHTHOUSE_CWV_LCP_MAX_MS;

export const LIGHTHOUSE_CI_GATE_P3_60_CLS_MAX = LIGHTHOUSE_CWV_CLS_MAX;

export const LIGHTHOUSE_CI_GATE_P3_60_PATHS = LIGHTHOUSE_CWV_PATHS;

export const LIGHTHOUSE_CI_GATE_P3_60_PATH_COUNT = LIGHTHOUSE_CWV_PATHS.length;

export const LIGHTHOUSE_CI_GATE_P3_60_FLOW_STEPS = [
  "validate_lighthouse_ci_contract",
  "collect_lhci_metrics",
  "assert_fcp_lcp_cls_thresholds",
  "verify_lighthouse_workflow",
] as const;

export const LIGHTHOUSE_CI_GATE_P3_60_NPM_SCRIPTS = [
  "lighthouse:core-web-vitals",
  "test:ci:lighthouse-core-web-vitals",
] as const;

export const LIGHTHOUSE_CI_GATE_P3_60_WIRING_PATHS = [
  LIGHTHOUSE_CI_GATE_P3_60_DOC,
  "lib/performance/lighthouse-core-web-vitals-policy.ts",
  "lib/qa/lighthouse-ci-gate-p3-60-measurement.ts",
  "lib/qa/lighthouse-ci-gate-p3-60-audit.ts",
  LIGHTHOUSE_CI_GATE_P3_60_CONFIG,
  LIGHTHOUSE_CI_GATE_P3_60_WORKFLOW,
  LIGHTHOUSE_CI_GATE_P3_60_E2E_SPEC,
  LIGHTHOUSE_CI_GATE_P3_60_FLOW_HELPER,
  LIGHTHOUSE_CI_GATE_P3_60_READY_HELPER,
  LIGHTHOUSE_CI_GATE_P3_60_UNIT_TEST,
  LIGHTHOUSE_CI_GATE_P3_60_UPSTREAM_TEST,
  LIGHTHOUSE_CI_GATE_P3_60_ARTIFACT,
] as const;

export function isLighthouseCiGateP3_60Enabled(): boolean {
  return process.env.E2E_LIGHTHOUSE_CI_GATE?.trim() === "true";
}
