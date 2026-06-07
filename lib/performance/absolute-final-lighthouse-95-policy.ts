/**
 * Absolute Final Task 148 — full performance audit (Lighthouse 95+).
 *
 * @see docs/PERFORMANCE_REVIEW.md
 * @see lib/performance/lighthouse-core-web-vitals-policy.ts
 * @see tests/unit/absolute-final-lighthouse-95-performance.test.ts
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

export const LIGHTHOUSE_95_ABSOLUTE_FINAL_POLICY_ID =
  "absolute-final-lighthouse-95-v1" as const;

export const LIGHTHOUSE_95_MIN_SCORE = 0.95 as const;

export const LIGHTHOUSE_95_DOC_PATH = "docs/PERFORMANCE_REVIEW.md" as const;

export const LIGHTHOUSE_95_UPSTREAM_POLICY_ID = LIGHTHOUSE_CORE_WEB_VITALS_POLICY_ID;

export const LIGHTHOUSE_95_LHCI_PERFORMANCE_ASSERTION = [
  "error",
  { minScore: LIGHTHOUSE_95_MIN_SCORE },
] as const;

export const LIGHTHOUSE_95_WIRING_PATHS = [
  LIGHTHOUSE_95_DOC_PATH,
  LIGHTHOUSE_CWV_CONFIG_PATH,
  LIGHTHOUSE_CWV_WORKFLOW_PATH,
  "lib/performance/absolute-final-lighthouse-95-policy.ts",
  "lib/performance/absolute-final-lighthouse-95-audit.ts",
  "lib/performance/lighthouse-core-web-vitals-policy.ts",
  "lib/performance/cwv-performance-regression-policy.ts",
  "scripts/check-cwv-performance-regression.ts",
  "artifacts/cwv-performance-baseline.json",
  "tests/unit/absolute-final-lighthouse-95-performance.test.ts",
  "tests/unit/lighthouse-core-web-vitals-policy.test.ts",
] as const;

export const LIGHTHOUSE_95_UNIT_TEST =
  "tests/unit/absolute-final-lighthouse-95-performance.test.ts" as const;

export const LIGHTHOUSE_95_CI_SCRIPTS = [
  "test:ci:lighthouse-95-absolute-final",
  "test:ci:lighthouse-95-absolute-final:cert",
] as const;

export const LIGHTHOUSE_95_MANUAL_GATE_NOTE =
  "LHCI desktop preset on marketing paths — production traffic and mobile surfaces may differ; re-run before major releases." as const;

export function lighthousePerformanceScorePass(score: number): boolean {
  return score >= LIGHTHOUSE_95_MIN_SCORE;
}

export const LIGHTHOUSE_95_CWV_CEILINGS = {
  fcpMs: LIGHTHOUSE_CWV_FCP_MAX_MS,
  lcpMs: LIGHTHOUSE_CWV_LCP_MAX_MS,
  cls: LIGHTHOUSE_CWV_CLS_MAX,
  paths: LIGHTHOUSE_CWV_PATHS,
} as const;
