/**
 * Platform impersonation E2E policy (QA-25).
 *
 * Super-admin MFA-gated start, TTL cookie, audit start/end, tenant dashboard banner.
 *
 * @see e2e/platform-impersonation.spec.ts
 * @see actions/platform-impersonation.ts
 * @see docs/PLATFORM_IMPERSONATION.md
 */

import {
  PLATFORM_IMPERSONATION_COOKIE,
  PLATFORM_IMPERSONATION_MAX_SECONDS,
} from "@/lib/platform/platform-impersonation";
import {
  PLATFORM_IMPERSONATION_DEFAULT_REDIRECT,
  sanitizePlatformImpersonationRedirect,
} from "@/lib/platform/platform-impersonation-redirect";

export const PLATFORM_IMPERSONATION_E2E_POLICY_ID = "platform-impersonation-e2e-v1" as const;

export { PLATFORM_IMPERSONATION_COOKIE, PLATFORM_IMPERSONATION_MAX_SECONDS };

export const PLATFORM_IMPERSONATION_AUDIT_ACTIONS = {
  start: "platform.impersonation.start",
  end: "platform.impersonation.end",
} as const;

export type PlatformImpersonationAuditAction =
  (typeof PLATFORM_IMPERSONATION_AUDIT_ACTIONS)[keyof typeof PLATFORM_IMPERSONATION_AUDIT_ACTIONS];

export const PLATFORM_IMPERSONATION_NOTICE_TITLE = "Platform support view" as const;
export const PLATFORM_IMPERSONATION_END_BUTTON = "End impersonation" as const;

export const PLATFORM_IMPERSONATION_TODAY_PATH = "/dashboard/today" as const;
export const PLATFORM_USERS_PATH = "/platform/users" as const;

export const PLATFORM_IMPERSONATION_MFA_ERROR =
  "Impersonation requires a valid MFA code or step-up token." as const;

export const PLATFORM_IMPERSONATION_PROTECTED_TARGET_ERROR =
  "Cannot impersonate another platform super-admin." as const;

export { PLATFORM_IMPERSONATION_DEFAULT_REDIRECT, sanitizePlatformImpersonationRedirect };

export function isPlatformImpersonationAuditAction(
  action: string,
): action is PlatformImpersonationAuditAction {
  return (
    action === PLATFORM_IMPERSONATION_AUDIT_ACTIONS.start ||
    action === PLATFORM_IMPERSONATION_AUDIT_ACTIONS.end
  );
}

export type PlatformImpersonationStartAuditMetadata = {
  sessionId: string;
  reason: string;
  targetUserId: string;
};

export function isPlatformImpersonationStartAuditMetadata(
  metadata: unknown,
): metadata is PlatformImpersonationStartAuditMetadata {
  if (!metadata || typeof metadata !== "object") return false;
  const row = metadata as Record<string, unknown>;
  return (
    typeof row.sessionId === "string" &&
    typeof row.reason === "string" &&
    typeof row.targetUserId === "string"
  );
}

export function platformImpersonationTtlHours(): number {
  return PLATFORM_IMPERSONATION_MAX_SECONDS / 3600;
}
