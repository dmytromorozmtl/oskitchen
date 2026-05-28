/**
 * Repository hygiene policy — Evolution Era 7 Cycle 3.
 *
 * Prevents accidental commits of nested test installs (e.g. Vitest cache under
 * `tests/node_modules/`) that pollute working trees and CI artifact uploads.
 */

export const REPO_HYGIENE_POLICY_ID = "era7-tests-node-modules-hygiene-v1" as const;

/** Paths that must appear in root `.gitignore` (leading slash = repo root). */
export const REPO_HYGIENE_REQUIRED_GITIGNORE_LINES = [
  "/tests/node_modules/",
  "/ci-artifacts/",
] as const;

/** Path prefixes that must never be tracked by git. */
export const REPO_HYGIENE_FORBIDDEN_TRACKED_PREFIXES = [
  "tests/node_modules/",
  "tests/node_modules",
] as const;

export const REPO_HYGIENE_CI_SCRIPTS = [
  "test:ci:repo-hygiene",
  "test:ci:repo-hygiene:cert",
] as const;

export const REPO_HYGIENE_UNIT_TESTS = [
  "tests/unit/repo-hygiene-policy.test.ts",
  "tests/unit/repo-hygiene-ci-live.test.ts",
] as const;

export const REPO_HYGIENE_CANONICAL_DOC_PATHS = [
  "docs/devops-release-enterprise-readiness.md",
  "docs/definition-of-done.md",
] as const;

export const REPO_HYGIENE_CANONICAL_DOC_MARKERS = [
  REPO_HYGIENE_POLICY_ID,
  "tests/node_modules",
  "test:ci:repo-hygiene:cert",
] as const;

/**
 * Returns tracked git paths that violate the tests/node_modules hygiene rule.
 */
export function findForbiddenTrackedPaths(trackedPaths: readonly string[]): string[] {
  return trackedPaths.filter((path) =>
    REPO_HYGIENE_FORBIDDEN_TRACKED_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    ),
  );
}

/**
 * Returns true when every required gitignore line is present (exact or as a line in file).
 */
export function gitignoreCoversRequiredLines(gitignoreContent: string): boolean {
  const lines = gitignoreContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
  return REPO_HYGIENE_REQUIRED_GITIGNORE_LINES.every((required) => lines.includes(required));
}
