/**
 * Typecheck slice Era 15 recertification — Evolution Era 15 Cycle 4.
 *
 * Re-validates Era 4/5/6/11 strict typecheck slices after Era 14/15 honesty cycles.
 * Full `typecheck:full` remains the canonical CI gate in `quality`; slices are additive.
 */

import {
  TYPECHECK_SLICE_ERA11_POLICY_ID,
} from "@/lib/ci/typecheck-slice-era11-policy";
import {
  TYPECHECK_FULL_SCRIPT,
  TYPECHECK_SLICE_CI_BUNDLE_SCRIPT,
  TYPECHECK_SLICE_CI_JOB_HEAP_MB,
  TYPECHECK_SLICE_CI_JOB_ID,
  TYPECHECK_SLICE_CI_PARALLEL_POLICY_ID,
  TYPECHECK_SLICE_CI_QUALITY_STEP,
  TYPECHECK_SLICE_POLICY_ID,
  TYPECHECK_SLICES,
  type TypecheckSliceId,
} from "@/lib/ci/typecheck-slice-policy";

export const TYPECHECK_SLICE_ERA15_POLICY_ID = "era15-typecheck-slice-recert-v1" as const;

export const TYPECHECK_SLICE_ERA15_EXTENDS_POLICIES = [
  "era4-typecheck-slice-v1",
  TYPECHECK_SLICE_POLICY_ID,
  "era5-typecheck-slice-v2",
  TYPECHECK_SLICE_ERA11_POLICY_ID,
  TYPECHECK_SLICE_CI_PARALLEL_POLICY_ID,
] as const;

export const TYPECHECK_SLICE_ERA15_SLICE_IDS = TYPECHECK_SLICES.map(
  (s) => s.id,
) as readonly TypecheckSliceId[];

export const TYPECHECK_SLICE_ERA15_FULL_HEAP_MB = 8192 as const;

export const TYPECHECK_SLICE_ERA15_SLICE_HEAP_MB = TYPECHECK_SLICE_CI_JOB_HEAP_MB;

export const TYPECHECK_SLICE_ERA15_DOES_NOT_REPLACE_FULL =
  "Slices do not replace typecheck:full in quality" as const;

export const TYPECHECK_SLICE_ERA15_PILOT_CHECKLIST = [
  "Before large refactors: run npm run smoke:typecheck-slices or a single typecheck:slice:* for the touched area.",
  "CI canonical gate remains npm run typecheck (typecheck:full at 8GB) in the quality job.",
  "Parallel typecheck-slices job runs all four slices at 6GB — failure there still requires full typecheck fix before merge.",
  "Do not weaken tsconfig.base.json strictness to make slices pass.",
  "Archived experimental cron routes must stay out of slice includes (Era 14 cron recert).",
] as const;

export const TYPECHECK_SLICE_ERA15_OPS_DOC =
  "docs/devops-release-enterprise-readiness.md" as const;

export const TYPECHECK_SLICE_ERA15_SMOKE_SCRIPT = "scripts/smoke-typecheck-slices.ts" as const;

export const TYPECHECK_SLICE_ERA15_SMOKE_NPM_SCRIPT = "smoke:typecheck-slices" as const;

export const TYPECHECK_SLICE_ERA15_CI_SCRIPTS = [
  "test:ci:typecheck-slice-era15",
  "test:ci:typecheck-slice-era15:cert",
] as const;

export const TYPECHECK_SLICE_ERA15_UNIT_TESTS = [
  "tests/unit/typecheck-slice-era15-policy.test.ts",
  "tests/unit/typecheck-slice-era15-cert-live.test.ts",
] as const;

export const TYPECHECK_SLICE_ERA15_CANONICAL_DOC_PATHS = [
  TYPECHECK_SLICE_ERA15_OPS_DOC,
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/p0-hardening-roadmap.md",
  "docs/implementation-backlog.md",
] as const;

export const TYPECHECK_SLICE_ERA15_CANONICAL_MARKERS = [
  TYPECHECK_SLICE_ERA15_POLICY_ID,
  TYPECHECK_SLICE_POLICY_ID,
  TYPECHECK_SLICE_CI_PARALLEL_POLICY_ID,
  TYPECHECK_FULL_SCRIPT,
  TYPECHECK_SLICE_CI_JOB_ID,
  "does not replace",
] as const;

export const TYPECHECK_SLICE_ERA15_QUALITY_STEP = TYPECHECK_SLICE_CI_QUALITY_STEP;

export const TYPECHECK_SLICE_ERA15_BUNDLE_SCRIPT = TYPECHECK_SLICE_CI_BUNDLE_SCRIPT;
