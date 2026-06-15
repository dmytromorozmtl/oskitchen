/**
 * Absolute Final Task 57 — skip link + main landmark in dashboard shell.
 *
 * Dashboard routes need a skip target past header chrome. Root layout
 * `#main-content` wraps the entire shell; this policy wires a dashboard-local
 * skip link → semantic `<main>` landmark.
 *
 * @see components/dashboard/dashboard-shell.tsx
 * @see components/a11y/dashboard-skip-link.tsx
 */

export const SKIP_LINK_MAIN_LANDMARK_POLICY_ID =
  "skip-link-main-landmark-absolute-final-v1" as const;

/** Skip target on dashboard `<main>` — distinct from root layout wrapper id. */
export const DASHBOARD_MAIN_LANDMARK_ID = "dashboard-main-content" as const;

export const DASHBOARD_SKIP_LINK_LABEL = "Skip to main content" as const;

export const DASHBOARD_MAIN_LANDMARK_ARIA_LABEL = "Dashboard main content" as const;

export const DASHBOARD_SHELL_MODULE = "components/dashboard/dashboard-shell.tsx" as const;

export const DASHBOARD_SKIP_LINK_MODULE = "components/a11y/dashboard-skip-link.tsx" as const;

export const SKIP_LINK_MAIN_LANDMARK_UNIT_TEST =
  "tests/unit/skip-link-main-landmark.test.ts" as const;

export const SKIP_LINK_MAIN_LANDMARK_CI_SCRIPTS = [
  "test:ci:skip-link-main-landmark",
  "test:ci:skip-link-main-landmark:cert",
] as const;

export const SKIP_LINK_MAIN_LANDMARK_WIRING_PATHS = [
  "lib/accessibility/skip-link-main-landmark-policy.ts",
  "lib/accessibility/skip-link-main-landmark-audit.ts",
  DASHBOARD_SKIP_LINK_MODULE,
  DASHBOARD_SHELL_MODULE,
  SKIP_LINK_MAIN_LANDMARK_UNIT_TEST,
] as const;
