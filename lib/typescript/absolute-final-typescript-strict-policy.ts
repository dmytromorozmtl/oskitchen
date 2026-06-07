/**
 * Absolute Final Task 146 — full TypeScript strict mode.
 *
 * @see tsconfig.base.json
 * @see tests/unit/absolute-final-typescript-strict.test.ts
 */

export const TYPESCRIPT_STRICT_ABSOLUTE_FINAL_POLICY_ID =
  "absolute-final-typescript-strict-v1" as const;

export const TYPESCRIPT_STRICT_BASE_CONFIG_PATH = "tsconfig.base.json" as const;

export const TYPESCRIPT_STRICT_ROOT_CONFIG_PATH = "tsconfig.json" as const;

export const TYPESCRIPT_STRICT_TYPECHECK_CONFIG_PATH = "tsconfig.typecheck.json" as const;

/** Enabled in tsconfig.base.json — core + extended strict flags. */
export const TYPESCRIPT_STRICT_REQUIRED_COMPILER_OPTIONS = {
  strict: true,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  forceConsistentCasingInFileNames: true,
} as const;

/** Documented phased flags — not required for Task 146 cert (enable in follow-up). */
export const TYPESCRIPT_STRICT_PHASED_COMPILER_OPTIONS = [
  "noUncheckedIndexedAccess",
  "exactOptionalPropertyTypes",
] as const;

export const TYPESCRIPT_STRICT_WIRING_PATHS = [
  TYPESCRIPT_STRICT_BASE_CONFIG_PATH,
  TYPESCRIPT_STRICT_ROOT_CONFIG_PATH,
  TYPESCRIPT_STRICT_TYPECHECK_CONFIG_PATH,
  "lib/typescript/absolute-final-typescript-strict-policy.ts",
  "lib/typescript/absolute-final-typescript-strict-audit.ts",
  "tests/unit/absolute-final-typescript-strict.test.ts",
  "tests/unit/typecheck-slice-policy.test.ts",
] as const;

export const TYPESCRIPT_STRICT_UNIT_TEST =
  "tests/unit/absolute-final-typescript-strict.test.ts" as const;

export const TYPESCRIPT_STRICT_CI_SCRIPTS = [
  "test:ci:typescript-strict-absolute-final",
  "test:ci:typescript-strict-absolute-final:cert",
] as const;

export type TypeScriptStrictCompilerOptions = Record<string, boolean | string | number>;

export function isFullStrictCompilerOptions(
  options: TypeScriptStrictCompilerOptions,
): boolean {
  for (const [key, expected] of Object.entries(TYPESCRIPT_STRICT_REQUIRED_COMPILER_OPTIONS)) {
    if (options[key] !== expected) return false;
  }
  return true;
}
