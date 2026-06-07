/**
 * Absolute Final Task 19 — Suspense + skeleton streaming fallbacks (DES-28).
 */

export const SUSPENSE_SKELETON_POLICY_ID = "absolute-final-suspense-skeleton-v1" as const;

/** Today page async sections wrapped in Suspense (Task 5). */
export const SUSPENSE_SKELETON_TODAY_SECTIONS = [
  {
    id: "hero",
    suspenseFallback: 'TodaySkeleton section="hero"',
    testId: "today-skeleton-hero",
    asyncComponent: "OwnerDailyBriefingHeroSection",
  },
  {
    id: "wizard",
    suspenseFallback: 'TodaySkeleton section="wizard"',
    testId: "today-skeleton-wizard",
    asyncComponent: "LaunchWizardTodayStripSection",
  },
  {
    id: "playbook",
    suspenseFallback: 'TodaySkeleton section="playbook"',
    testId: "today-skeleton-playbook",
    asyncComponent: "PlaybookTodayStrip",
  },
] as const;

export const SUSPENSE_SKELETON_CRITICAL_LOADING_MODULES = [
  "app/dashboard/today/loading.tsx",
  "app/dashboard/orders/loading.tsx",
  "app/dashboard/today/profit/loading.tsx",
  "app/dashboard/integrations/health/loading.tsx",
] as const;

/** Simulated slow 3G throttle for Suspense fallback tests (ms). */
export const SUSPENSE_SKELETON_SLOW_NETWORK_MS = 750;

/** Max time a Suspense boundary may remain pending before treated as hung (ms). */
export const SUSPENSE_SKELETON_MAX_HANG_MS = 8_000;

export const SUSPENSE_SKELETON_UNIT_TESTS = [
  "tests/unit/suspense-skeleton.test.ts",
  "tests/unit/today-page-suspense.test.ts",
  "tests/unit/loading-skeleton-audit-policy.test.ts",
] as const;

export const SUSPENSE_SKELETON_CI_SCRIPTS = ["test:ci:suspense-skeleton"] as const;

export const SUSPENSE_SKELETON_HARNESS_MODULE = "lib/testing/suspense-skeleton-harness.ts" as const;

export const SUSPENSE_SKELETON_PAGE_PATH = "app/dashboard/today/page.tsx" as const;
