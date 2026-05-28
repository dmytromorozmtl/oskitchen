/**
 * Typecheck slice policy — Evolution Era 4 Cycle 7 + Era 5 Cycle 2 + Era 11 Cycle 1.
 *
 * Full repo typecheck remains canonical for CI (`npm run typecheck`).
 * Slices allow faster local feedback on operational spine code with lower heap.
 */

export const TYPECHECK_SLICE_POLICY_ID = "era11-typecheck-slice-v3" as const;

export const TYPECHECK_SLICE_PREVIOUS_POLICY_ID = "era5-typecheck-slice-v2" as const;

export type TypecheckSliceId =
  | "services-core"
  | "dashboard-services-api"
  | "storefront-marketing"
  | "platform-auth";

export type TypecheckSliceDefinition = {
  id: TypecheckSliceId;
  tsconfig: string;
  /** Recommended Node heap (MB) for local `tsc --noEmit` on this slice. */
  heapMb: number;
  description: string;
  includes: readonly string[];
};

export const TYPECHECK_SLICES: readonly TypecheckSliceDefinition[] = [
  {
    id: "services-core",
    tsconfig: "tsconfig.slice.services-core.json",
    heapMb: 6144,
    description:
      "Services, actions, lib, types, prisma — no App Router pages; fastest strict slice for backend/spine edits.",
    includes: ["services/**", "actions/**", "lib/**", "types/**", "prisma/**"],
  },
  {
    id: "dashboard-services-api",
    tsconfig: "tsconfig.slice.dashboard-services-api.json",
    heapMb: 6144,
    description:
      "Dashboard UI, API routes, services, actions, shared lib/components — operational spine without marketing/storefront public pages.",
    includes: [
      "app/api/**",
      "app/dashboard/**",
      "services/**",
      "actions/**",
      "lib/**",
      "components/**",
    ],
  },
  {
    id: "storefront-marketing",
    tsconfig: "tsconfig.slice.storefront-marketing.json",
    heapMb: 6144,
    description:
      "Public storefront (app/s, app/b), GTM/marketing pages, dashboard storefront admin, and storefront API routes — without full dashboard spine.",
    includes: [
      "app/s/**",
      "app/b/**",
      "app/lp/**",
      "app/pricing/**",
      "app/product/**",
      "app/markets/**",
      "app/dashboard/storefront/**",
      "app/api/storefront/**",
      "app/api/dashboard/storefront/**",
    ],
  },
  {
    id: "platform-auth",
    tsconfig: "tsconfig.slice.platform-auth.json",
    heapMb: 6144,
    description:
      "Platform admin (app/platform), login/onboarding/forgot-password — internal surfaces omitted from dashboard/storefront slices.",
    includes: [
      "app/platform/**",
      "app/login/**",
      "app/onboarding/**",
      "app/forgot-password/**",
    ],
  },
] as const;

export const TYPECHECK_FULL_SCRIPT = "typecheck:full" as const;

export const TYPECHECK_SLICE_CI_SCRIPTS = [
  "test:ci:typecheck-slice",
  "test:ci:typecheck-slice:cert",
] as const;

export function typecheckSliceScript(sliceId: TypecheckSliceId): string {
  return `typecheck:slice:${sliceId}`;
}

export function findTypecheckSlice(sliceId: TypecheckSliceId): TypecheckSliceDefinition {
  const slice = TYPECHECK_SLICES.find((s) => s.id === sliceId);
  if (!slice) {
    throw new Error(`Unknown typecheck slice: ${sliceId}`);
  }
  return slice;
}

/**
 * Era 6 Cycle 3 — optional parallel CI job for strict slices at lower heap.
 * Full `npm run typecheck` in the `quality` job remains the canonical release gate.
 */
export const TYPECHECK_SLICE_CI_PARALLEL_POLICY_ID = "era6-typecheck-slice-ci-v1" as const;

export const TYPECHECK_SLICE_CI_JOB_ID = "typecheck-slices" as const;

export const TYPECHECK_SLICE_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const TYPECHECK_SLICE_CI_BUNDLE_SCRIPT = "typecheck:ci:slices" as const;

/** Heap (MB) for the parallel CI slice job — per-slice scripts also set 6144. */
export const TYPECHECK_SLICE_CI_JOB_HEAP_MB = 6144 as const;

export const TYPECHECK_SLICE_CI_QUALITY_STEP = "npm run typecheck" as const;

export const TYPECHECK_SLICE_CI_UNIT_TESTS = [
  "tests/unit/typecheck-slice-ci-live.test.ts",
  "tests/unit/typecheck-slice-ci-parallel-live.test.ts",
] as const;
