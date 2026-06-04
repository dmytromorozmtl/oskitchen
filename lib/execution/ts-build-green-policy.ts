/**
 * FINAL-13 — typecheck + production build green policy constants.
 */

export const TS_BUILD_GREEN_POLICY_ID = "final-13-ts-build-green-v1" as const;

export const TS_BUILD_GREEN_SUMMARY_ARTIFACT = "artifacts/ts-build-green-summary.json" as const;

export const TS_BUILD_GREEN_SUMMARY_VERSION = "final-13-ts-build-green-v1" as const;

export const TS_BUILD_GREEN_TYPECHECK_SCRIPT = "typecheck:full" as const;

export const TS_BUILD_GREEN_BUILD_SCRIPT = "build" as const;

export const TS_BUILD_GREEN_RUNNER_SCRIPT = "scripts/ops/run-ts-build-green-audit.ts" as const;
