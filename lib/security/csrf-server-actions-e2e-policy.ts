/**
 * CSRF server actions E2E policy (QA-28).
 *
 * Next.js serverActions.allowedOrigins + cookie-session mutation origin guard.
 *
 * @see e2e/csrf-server-actions.spec.ts
 * @see lib/security/mutation-origin-guard.ts
 * @see next.config.ts experimental.serverActions.allowedOrigins
 */

export const CSRF_SERVER_ACTIONS_E2E_POLICY_ID = "csrf-server-actions-e2e-v1" as const;

/** Must stay aligned with `next.config.ts` → experimental.serverActions.allowedOrigins */
export const NEXT_SERVER_ACTION_ALLOWED_ORIGIN_HOSTS = [
  "localhost:3000",
  "127.0.0.1:3000",
  "os-kitchen.com",
  "www.os-kitchen.com",
  "*.vercel.app",
] as const;

export const CSRF_MUTATION_HTTP_METHODS = ["POST", "PUT", "PATCH", "DELETE"] as const;

export type CsrfMutationHttpMethod = (typeof CSRF_MUTATION_HTTP_METHODS)[number];

export const CSRF_ORIGIN_FORBIDDEN_STATUS = 403 as const;

export const CSRF_ORIGIN_FORBIDDEN_MESSAGES = {
  forbiddenOrigin: "Forbidden origin",
  originRequired: "Origin required",
  invalidOrigin: "Invalid origin",
} as const;

/** Cookie-session API routes that call `rejectCrossSiteMutation` before auth. */
export const CSRF_PROTECTED_COOKIE_SESSION_ROUTES = [
  {
    id: "dsr-export",
    path: "/api/internal/dsr/export",
    method: "POST" as const,
    module: "app/api/internal/dsr/export/route.ts",
  },
] as const;

export const CSRF_E2E_FOREIGN_ORIGIN = "https://evil.csrf-e2e.test" as const;

export function isCsrfMutationHttpMethod(method: string): method is CsrfMutationHttpMethod {
  return (CSRF_MUTATION_HTTP_METHODS as readonly string[]).includes(method.toUpperCase());
}

export function isCsrfOriginForbiddenStatus(status: number): boolean {
  return status === CSRF_ORIGIN_FORBIDDEN_STATUS;
}

export function isAllowedServerActionOriginHost(host: string): boolean {
  const normalized = host.trim().toLowerCase();
  return NEXT_SERVER_ACTION_ALLOWED_ORIGIN_HOSTS.some((allowed) => {
    if (allowed.startsWith("*.")) {
      const suffix = allowed.slice(1);
      return normalized.endsWith(suffix);
    }
    return normalized === allowed.toLowerCase();
  });
}

export function resolveTrustedAppOrigin(): string | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl) return null;
  try {
    return new URL(appUrl).origin;
  } catch {
    return null;
  }
}

export function csrfProtectedRoutePaths(): readonly string[] {
  return CSRF_PROTECTED_COOKIE_SESSION_ROUTES.map((route) => route.path);
}
