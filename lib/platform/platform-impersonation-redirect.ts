import { safeInternalNextPath } from "@/lib/auth/safe-redirect";

export const PLATFORM_IMPERSONATION_DEFAULT_REDIRECT = "/platform/dashboard" as const;

/** Post-impersonation landing — tenant dashboard routes only (blocks open redirects). */
export function sanitizePlatformImpersonationRedirect(
  raw: string | null | undefined,
  fallback: string = PLATFORM_IMPERSONATION_DEFAULT_REDIRECT,
): string {
  const path = safeInternalNextPath(raw, fallback);
  if (path.startsWith("/dashboard/")) return path;
  return fallback;
}

/** Post-support-session landing — platform routes only. */
export function sanitizePlatformSupportSessionRedirect(
  raw: string | null | undefined,
  fallback: string,
): string {
  const path = safeInternalNextPath(raw, fallback);
  if (path.startsWith("/platform/")) return path;
  return fallback;
}
