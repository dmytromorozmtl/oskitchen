/**
 * Absolute Final Task 151 — completion capstone (150 tasks).
 *
 * @see docs/absolute-final-report.md
 * @see artifacts/absolute-final-tracker.json
 */

export const ABSOLUTE_FINAL_COMPLETION_POLICY_ID =
  "absolute-final-completion-150-v1" as const;

export const ABSOLUTE_FINAL_COMPLETION_DOC_PATH = "docs/absolute-final-report.md" as const;

export const ABSOLUTE_FINAL_TRACKER_PATH = "artifacts/absolute-final-tracker.json" as const;

export const ABSOLUTE_FINAL_TASK_TOTAL = 150 as const;

export const ABSOLUTE_FINAL_BLOCKED_TASK_IDS = ["2-activate-sentry-dsn"] as const;

export const ABSOLUTE_FINAL_FINAL_AUDIT_TASKS = [
  "146-full-typescript-strict-mode",
  "147-full-wcag-21-aa-accessibility",
  "148-full-lighthouse-95-performance",
  "149-full-owasp-top-10-security",
  "150-full-competitor-parity-check",
] as const;

export const ABSOLUTE_FINAL_SCORECARD_DIMENSIONS = [
  "Architecture",
  "Product completeness",
  "Code quality",
  "UX/design",
  "Performance",
  "Security/RBAC",
  "Testing",
  "DevOps/CI",
  "Accessibility",
  "Documentation",
  "Competitor parity",
  "Observability",
] as const;

export const ABSOLUTE_FINAL_WIRING_PATHS = [
  ABSOLUTE_FINAL_COMPLETION_DOC_PATH,
  ABSOLUTE_FINAL_TRACKER_PATH,
  "lib/absolute-final/absolute-final-completion-policy.ts",
  "lib/absolute-final/absolute-final-completion-audit.ts",
  "tests/unit/absolute-final-completion.test.ts",
  "docs/PERFORMANCE_REVIEW.md",
  "docs/SECURITY_REVIEW.md",
  "docs/accessibility-audit.md",
  "docs/full-competitor-parity-check.md",
  "artifacts/execution-log.txt",
] as const;

export const ABSOLUTE_FINAL_UNIT_TEST = "tests/unit/absolute-final-completion.test.ts" as const;

export const ABSOLUTE_FINAL_CI_SCRIPTS = [
  "test:ci:absolute-final-completion",
  "test:ci:absolute-final-completion:cert",
] as const;

export const ABSOLUTE_FINAL_META_KEYS = [
  "151-absolute-final-complete",
  "completedAt",
  "summary",
] as const;

export function isAbsoluteFinalTaskKey(key: string): boolean {
  return !key.endsWith("-note") && !ABSOLUTE_FINAL_META_KEYS.includes(key as (typeof ABSOLUTE_FINAL_META_KEYS)[number]);
}

export const ABSOLUTE_FINAL_COMPLETION_NOTE =
  "149/150 tasks done — Task 2 Sentry DSN blocked pending SENTRY_DSN on Vercel; all other audit gates certified." as const;
