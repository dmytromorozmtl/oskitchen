import { expect, test } from "@playwright/test";

import {
  CSRF_MUTATION_HTTP_METHODS,
  CSRF_ORIGIN_FORBIDDEN_MESSAGES,
  CSRF_PROTECTED_COOKIE_SESSION_ROUTES,
  CSRF_SERVER_ACTIONS_E2E_POLICY_ID,
  NEXT_SERVER_ACTION_ALLOWED_ORIGIN_HOSTS,
  csrfProtectedRoutePaths,
  isAllowedServerActionOriginHost,
  isCsrfMutationHttpMethod,
  isCsrfOriginForbiddenStatus,
} from "@/lib/security/csrf-server-actions-e2e-policy";

import {
  assertHttpAllowsTrustedOriginPastCsrfGate,
  assertHttpBlocksForeignOriginOnProtectedRoute,
  assertMutationOriginGuardAllowsTrustedOrigin,
  assertMutationOriginGuardBlocksForeignOrigin,
  assertMutationOriginGuardIgnoresSafeMethods,
} from "./helpers/csrf-server-actions-flow";
import {
  resolveCsrfHttpBaseOrigin,
  skipCsrfServerActionsHttpIfNoBaseUrl,
} from "./helpers/csrf-server-actions-ready";

/**
 * CSRF server actions E2E — Next.js allowedOrigins + mutation origin guard on cookie routes.
 *
 * @see lib/security/mutation-origin-guard.ts
 * @see next.config.ts
 */

test.describe("CSRF server actions policy", () => {
  test("exports allowed origin hosts and protected routes", () => {
    expect(CSRF_SERVER_ACTIONS_E2E_POLICY_ID).toBe("csrf-server-actions-e2e-v1");
    expect(NEXT_SERVER_ACTION_ALLOWED_ORIGIN_HOSTS.length).toBeGreaterThanOrEqual(5);
    expect(CSRF_PROTECTED_COOKIE_SESSION_ROUTES.length).toBeGreaterThanOrEqual(1);
    expect(csrfProtectedRoutePaths()).toContain("/api/internal/dsr/export");
    expect(isCsrfOriginForbiddenStatus(403)).toBe(true);
    expect(isCsrfOriginForbiddenStatus(401)).toBe(false);
  });

  test("recognizes mutation HTTP methods", () => {
    for (const method of CSRF_MUTATION_HTTP_METHODS) {
      expect(isCsrfMutationHttpMethod(method)).toBe(true);
    }
    expect(isCsrfMutationHttpMethod("GET")).toBe(false);
  });

  test("validates server action origin host allowlist", () => {
    expect(isAllowedServerActionOriginHost("localhost:3000")).toBe(true);
    expect(isAllowedServerActionOriginHost("preview-abc.vercel.app")).toBe(true);
    expect(isAllowedServerActionOriginHost("evil.csrf-e2e.test")).toBe(false);
  });
});

test.describe("CSRF mutation origin guard", () => {
  test.beforeEach(() => {
    test.skip(
      process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL?.trim(),
      "NEXT_PUBLIC_APP_URL required for origin guard production checks",
    );
  });

  test("blocks POST with foreign Origin on protected route", async () => {
    await assertMutationOriginGuardBlocksForeignOrigin(
      "/api/internal/dsr/export",
      "POST",
    );
  });

  test("allows POST when Origin matches NEXT_PUBLIC_APP_URL", async () => {
    const trusted = process.env.NEXT_PUBLIC_APP_URL?.trim();
    test.skip(!trusted, "NEXT_PUBLIC_APP_URL not set — skip trusted origin allow test");

    await assertMutationOriginGuardAllowsTrustedOrigin(
      "/api/internal/dsr/export",
      "POST",
      new URL(trusted!).origin,
    );
  });

  test("does not block GET even with foreign Origin", async () => {
    await assertMutationOriginGuardIgnoresSafeMethods("/api/internal/dsr/export");
  });
});

test.describe("CSRF protected routes HTTP", () => {
  test.beforeEach(() => {
    skipCsrfServerActionsHttpIfNoBaseUrl();
  });

  test("HTTP POST DSR export rejects foreign Origin before auth", async ({ request }) => {
    const route = CSRF_PROTECTED_COOKIE_SESSION_ROUTES[0]!;
    await assertHttpBlocksForeignOriginOnProtectedRoute(request, route.path);
  });

  test("HTTP POST DSR export passes CSRF gate with trusted Origin", async ({ request }) => {
    const trustedOrigin = resolveCsrfHttpBaseOrigin();
    test.skip(!trustedOrigin, "Could not resolve trusted origin from PLAYWRIGHT_BASE_URL");

    const route = CSRF_PROTECTED_COOKIE_SESSION_ROUTES[0]!;
    const outcome = await assertHttpAllowsTrustedOriginPastCsrfGate(
      request,
      route.path,
      trustedOrigin!,
    );

    if (outcome === "blocked_csrf") {
      test.skip(
        true,
        `Trusted origin ${trustedOrigin} not in guard allowlist — check NEXT_PUBLIC_APP_URL alignment`,
      );
    }

    expect(CSRF_ORIGIN_FORBIDDEN_MESSAGES.forbiddenOrigin).toBe("Forbidden origin");
  });
});
