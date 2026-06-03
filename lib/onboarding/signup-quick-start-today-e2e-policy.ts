/**
 * Signup → Quick Start → Today E2E policy (QA-13).
 *
 * @see e2e/signup-quick-start-today.spec.ts
 * @see app/signup/page.tsx
 * @see app/dashboard/quick-start/page.tsx
 */

export const SIGNUP_QUICK_START_TODAY_E2E_POLICY_ID =
  "signup-quick-start-today-e2e-v1" as const;

export const SIGNUP_PATH = "/signup" as const;
export const ONBOARDING_PATH = "/onboarding" as const;
export const QUICK_START_PATH = "/dashboard/quick-start" as const;
export const TODAY_PATH = "/dashboard/today" as const;

/** Default post-signup redirect when email is confirmed and session is active. */
export const SIGNUP_POST_AUTH_DEFAULT_PATH = ONBOARDING_PATH;

/** Skip Quick Start marks onboarding complete and opens Today. */
export const QUICK_START_SKIP_DESTINATION = TODAY_PATH;

export const TODAY_HEADING_PATTERN = /^Today$|^Today in /i;

export function isSignupQuickStartE2EEnabled(): boolean {
  return process.env.E2E_SIGNUP_AUTO_CONFIRM?.trim() === "true";
}
