/**
 * Typecheck slice parallel reporting — Evolution Era 16 Cycle 11.
 *
 * Improves observability by running all strict slices and writing a summary
 * artifact. Does NOT replace `typecheck:full` as the canonical CI gate.
 */

import { TYPECHECK_SLICE_ERA15_POLICY_ID } from "@/lib/ci/typecheck-slice-era15-policy";
import {
  TYPECHECK_FULL_SCRIPT,
  TYPECHECK_SLICE_CI_BUNDLE_SCRIPT,
  TYPECHECK_SLICE_CI_JOB_ID,
  TYPECHECK_SLICE_CI_PARALLEL_POLICY_ID,
  TYPECHECK_SLICE_CI_QUALITY_STEP,
  TYPECHECK_SLICE_POLICY_ID,
  TYPECHECK_SLICES,
} from "@/lib/ci/typecheck-slice-policy";
import { TYPECHECK_SLICE_REPORT_VERSION } from "@/lib/ci/typecheck-slice-report";

export const TYPECHECK_SLICE_ERA16_POLICY_ID = "era16-typecheck-slice-report-v1" as const;

export const TYPECHECK_SLICE_ERA16_DECISION_DATE = "2026-05-28" as const;

export const TYPECHECK_SLICE_ERA16_EXTENDS_POLICIES = [
  TYPECHECK_SLICE_POLICY_ID,
  TYPECHECK_SLICE_ERA15_POLICY_ID,
  TYPECHECK_SLICE_CI_PARALLEL_POLICY_ID,
] as const;

export const TYPECHECK_SLICE_ERA16_REPORT_MODULE = "lib/ci/typecheck-slice-report.ts" as const;

export const TYPECHECK_SLICE_ERA16_RUNNER_SCRIPT =
  "scripts/run-typecheck-slices-report-era16.ts" as const;

export const TYPECHECK_SLICE_ERA16_CERT_SCRIPT =
  "scripts/cert-typecheck-slice-report-era16.ts" as const;

export const TYPECHECK_SLICE_ERA16_SUMMARY_ARTIFACT =
  "artifacts/typecheck-slice-summary.json" as const;

export const TYPECHECK_SLICE_ERA16_REPORT_NPM_SCRIPT = "typecheck:report:slices" as const;

export const TYPECHECK_SLICE_ERA16_HONEST_SCOPE = {
  replacesFullTypecheck: false,
  addsNewStrictSlice: false,
  reportsAllSliceFailures: true,
  inDefaultQualityJob: false,
} as const;

export const TYPECHECK_SLICE_ERA16_CANONICAL_MARKERS = [
  TYPECHECK_SLICE_ERA16_POLICY_ID,
  TYPECHECK_SLICE_ERA16_REPORT_MODULE,
  TYPECHECK_SLICE_REPORT_VERSION,
  "typecheck-slice-summary",
] as const;

export const TYPECHECK_SLICE_ERA16_FORBIDDEN_CLAIMS = [
  "slices replace full typecheck",
  "typecheck slices are canonical",
] as const;

export const TYPECHECK_SLICE_ERA16_CI_SCRIPTS = [
  "test:ci:typecheck-slice-era16",
  "test:ci:typecheck-slice-era16:cert",
] as const;

export const TYPECHECK_SLICE_ERA16_UNIT_TESTS = [
  "tests/unit/typecheck-slice-report.test.ts",
  "tests/unit/typecheck-slice-era16-policy.test.ts",
  "tests/unit/typecheck-slice-era16-cert-live.test.ts",
] as const;

export const TYPECHECK_SLICE_ERA16_CANONICAL_DOC_PATHS = [
  "docs/devops-release-enterprise-readiness.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/implementation-backlog.md",
] as const;

export const TYPECHECK_SLICE_ERA16_REVIEW_SECTION =
  "Era 16 typecheck slice reporting (2026-05-28)" as const;

export const TYPECHECK_SLICE_ERA16_SLICE_COUNT = TYPECHECK_SLICES.length;

export const TYPECHECK_SLICE_ERA16_FULL_GATE = TYPECHECK_FULL_SCRIPT;

export const TYPECHECK_SLICE_ERA16_PARALLEL_JOB = TYPECHECK_SLICE_CI_JOB_ID;

export const TYPECHECK_SLICE_ERA16_BUNDLE_SCRIPT = TYPECHECK_SLICE_CI_BUNDLE_SCRIPT;

export const TYPECHECK_SLICE_ERA16_QUALITY_STEP = TYPECHECK_SLICE_CI_QUALITY_STEP;
