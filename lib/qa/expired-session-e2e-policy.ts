/**
 * Expired / missing session E2E policy (P3-54 negative test suite).
 *
 * @see e2e/expired-session-e2e.spec.ts
 */

export const EXPIRED_SESSION_E2E_POLICY_ID = "expired-session-e2e-v1" as const;

export const EXPIRED_SESSION_E2E_SPEC = "e2e/expired-session-e2e.spec.ts" as const;

export const EXPIRED_SESSION_LOGIN_PATH = "/login" as const;

export const EXPIRED_SESSION_PROTECTED_DASHBOARD_PATH = "/dashboard/today" as const;

export const EXPIRED_SESSION_PROTECTED_API_PATH = "/api/public/v1/orders" as const;

export const EXPIRED_SESSION_UNAUTHORIZED_STATUSES = [401, 403] as const;

export const EXPIRED_SESSION_FLOW_STEPS = [
  "dashboard_redirects_to_login",
  "api_returns_unauthorized",
] as const;

export function isExpiredSessionUnauthorizedStatus(status: number): boolean {
  return EXPIRED_SESSION_UNAUTHORIZED_STATUSES.includes(
    status as (typeof EXPIRED_SESSION_UNAUTHORIZED_STATUSES)[number],
  );
}

export function isExpiredSessionLoginRedirect(url: string): boolean {
  return url.includes(EXPIRED_SESSION_LOGIN_PATH);
}
