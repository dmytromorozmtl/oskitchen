import { describe, expect, it, vi } from "vitest";

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
import { rejectCrossSiteMutation } from "@/lib/security/mutation-origin-guard";

describe("CSRF server actions E2E policy (QA-28)", () => {
  it("exports policy id, origin hosts, and protected routes", () => {
    expect(CSRF_SERVER_ACTIONS_E2E_POLICY_ID).toBe("csrf-server-actions-e2e-v1");
    expect(NEXT_SERVER_ACTION_ALLOWED_ORIGIN_HOSTS).toContain("localhost:3000");
    expect(csrfProtectedRoutePaths()).toContain("/api/internal/dsr/export");
    expect(CSRF_PROTECTED_COOKIE_SESSION_ROUTES[0]?.id).toBe("dsr-export");
  });

  it("recognizes mutation methods and 403 CSRF responses", () => {
    expect(CSRF_MUTATION_HTTP_METHODS).toEqual(["POST", "PUT", "PATCH", "DELETE"]);
    expect(isCsrfMutationHttpMethod("POST")).toBe(true);
    expect(isCsrfMutationHttpMethod("GET")).toBe(false);
    expect(isCsrfOriginForbiddenStatus(403)).toBe(true);
  });

  it("matches vercel preview hosts via wildcard allowlist", () => {
    expect(isAllowedServerActionOriginHost("kitchenos-git-main.vercel.app")).toBe(true);
    expect(isAllowedServerActionOriginHost("attacker.example")).toBe(false);
  });
});

describe("CSRF mutation origin guard contract (QA-28)", () => {
  it("blocks foreign origin POST in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.kitchenos.test");

    const response = rejectCrossSiteMutation(
      new Request("https://app.kitchenos.test/api/internal/dsr/export", {
        method: "POST",
        headers: { Origin: "https://evil.csrf-e2e.test" },
      }),
    );

    expect(response?.status).toBe(403);
    vi.unstubAllEnvs();
  });

  it("returns forbidden origin message text", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.kitchenos.test");

    const response = rejectCrossSiteMutation(
      new Request("https://app.kitchenos.test/api/internal/dsr/export", {
        method: "POST",
        headers: { Origin: "https://evil.csrf-e2e.test" },
      }),
    );

    const body = (await response!.json()) as { error?: string };
    expect(body.error).toBe(CSRF_ORIGIN_FORBIDDEN_MESSAGES.forbiddenOrigin);
    vi.unstubAllEnvs();
  });
});
