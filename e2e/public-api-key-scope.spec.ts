import { expect, test } from "@playwright/test";

import {
  PUBLIC_API_KEY_SCOPE_ALLOW_CASES,
  PUBLIC_API_KEY_SCOPE_DENIAL_CASES,
  PUBLIC_API_KEY_SCOPE_E2E_POLICY_ID,
  PUBLIC_API_V1_BASE_PATH,
  highRiskPublicApiWriteScopes,
  isPublicApiScopeForbiddenStatus,
  publicApiPathForResource,
  requiredScopeForDenialCase,
} from "@/lib/api-public/public-api-key-scope-e2e-policy";
import { PUBLIC_API_V1_HIGH_RISK_ROUTE_SCOPES } from "@/lib/api-public/public-api-v1-route-scopes";

import {
  assertCredentialScopesMatch,
  assertGuardAllowsGrantedScope,
  assertGuardDeniesMissingScope,
  assertHttpAllowsGrantedScope,
  assertHttpDeniesMissingScope,
  assertScopeMatrixAllows,
  assertScopeMatrixDenies,
} from "./helpers/public-api-key-scope-flow";
import {
  seedScopedPublicApiKey,
  skipPublicApiKeyScopeHttpIfNoBaseUrl,
  skipPublicApiKeyScopeIfNoDb,
} from "./helpers/public-api-key-scope-ready";

/**
 * Public API key scope E2E — scoped kos_ keys receive 403 outside granted scopes.
 *
 * @see docs/pen-test-plan.md PT-05
 * @see lib/api-public/guard.ts
 */

test.describe("public API key scope policy", () => {
  test("exports denial matrix and high-risk write scopes", () => {
    expect(PUBLIC_API_KEY_SCOPE_E2E_POLICY_ID).toBe("public-api-key-scope-e2e-v1");
    expect(PUBLIC_API_V1_BASE_PATH).toBe("/api/public/v1");
    expect(PUBLIC_API_KEY_SCOPE_DENIAL_CASES.length).toBeGreaterThanOrEqual(3);
    expect(PUBLIC_API_KEY_SCOPE_ALLOW_CASES.length).toBeGreaterThanOrEqual(3);
    expect(publicApiPathForResource("orders")).toBe("/api/public/v1/orders");
    expect(isPublicApiScopeForbiddenStatus(403)).toBe(true);
    expect(isPublicApiScopeForbiddenStatus(200)).toBe(false);
    expect(highRiskPublicApiWriteScopes()).toContain("orders:write");
    expect(PUBLIC_API_V1_HIGH_RISK_ROUTE_SCOPES.length).toBeGreaterThanOrEqual(3);
  });

  test("denial cases map to canonical route scope requirements", () => {
    for (const denialCase of PUBLIC_API_KEY_SCOPE_DENIAL_CASES) {
      expect(requiredScopeForDenialCase(denialCase)).toBe(denialCase.requiredScope);
    }
  });

  test("scope matrix denies and allows per policy contract", async () => {
    for (const denialCase of PUBLIC_API_KEY_SCOPE_DENIAL_CASES) {
      await assertScopeMatrixDenies(denialCase);
    }
    for (const allowCase of PUBLIC_API_KEY_SCOPE_ALLOW_CASES) {
      await assertScopeMatrixAllows(allowCase);
    }
  });
});

test.describe("public API key scope (database)", () => {
  test.beforeEach(() => {
    skipPublicApiKeyScopeIfNoDb();
  });

  test("seeded API key resolves with granted scopes only", async () => {
    const fixture = await seedScopedPublicApiKey("resolve", ["orders:read", "products:read"]);
    try {
      await assertCredentialScopesMatch(fixture.rawKey, ["orders:read", "products:read"]);
    } finally {
      await fixture.cleanup();
    }
  });

  test("guard denies POST orders when key lacks orders:write", async () => {
    const denialCase = PUBLIC_API_KEY_SCOPE_DENIAL_CASES.find(
      (entry) => entry.id === "orders-read-cannot-post",
    )!;
    const fixture = await seedScopedPublicApiKey("guard-deny", denialCase.grantedScopes);
    try {
      const outcome = await assertGuardDeniesMissingScope(denialCase, fixture.rawKey);
      if (outcome === "billing_blocked") {
        test.skip(true, "Enterprise billing gate blocked credential — scope guard not reached.");
      }
    } finally {
      await fixture.cleanup();
    }
  });

  test("guard allows GET orders when key has orders:read", async () => {
    const allowCase = PUBLIC_API_KEY_SCOPE_ALLOW_CASES.find(
      (entry) => entry.id === "orders-read-can-list",
    )!;
    const fixture = await seedScopedPublicApiKey("guard-allow", allowCase.grantedScopes);
    try {
      const outcome = await assertGuardAllowsGrantedScope(allowCase, fixture.rawKey);
      if (outcome === "billing_blocked") {
        test.skip(true, "Enterprise billing gate blocked credential — scope allow not reached.");
      }
    } finally {
      await fixture.cleanup();
    }
  });
});

test.describe("public API key scope HTTP", () => {
  test.beforeEach(() => {
    skipPublicApiKeyScopeIfNoDb();
    skipPublicApiKeyScopeHttpIfNoBaseUrl();
  });

  test("HTTP POST orders returns 403 when key lacks orders:write", async ({ request }) => {
    const denialCase = PUBLIC_API_KEY_SCOPE_DENIAL_CASES.find(
      (entry) => entry.id === "orders-read-cannot-post",
    )!;
    const fixture = await seedScopedPublicApiKey("http-deny", denialCase.grantedScopes);
    try {
      const outcome = await assertHttpDeniesMissingScope(request, denialCase, fixture.rawKey);
      if (outcome === "billing_blocked") {
        test.skip(true, "Enterprise billing gate blocked credential on HTTP path.");
      }
    } finally {
      await fixture.cleanup();
    }
  });

  test("HTTP GET products succeeds when key has products:read", async ({ request }) => {
    const allowCase = PUBLIC_API_KEY_SCOPE_ALLOW_CASES.find(
      (entry) => entry.id === "products-read-can-list",
    )!;
    const fixture = await seedScopedPublicApiKey("http-allow", allowCase.grantedScopes);
    try {
      const outcome = await assertHttpAllowsGrantedScope(request, allowCase, fixture.rawKey);
      if (outcome === "billing_blocked") {
        test.skip(true, "Enterprise billing gate blocked credential on HTTP path.");
      }
    } finally {
      await fixture.cleanup();
    }
  });
});
