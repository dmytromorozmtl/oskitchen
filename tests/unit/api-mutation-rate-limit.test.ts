import { describe, expect, it, vi } from "vitest";

import {
  apiMutationScopeKey,
  enforceApiRateLimitOrNull,
  isApiMutationRateLimitExempt,
  isApiMutationMethod,
} from "@/lib/api/middleware-api-rate-limit";
import {
  assertApiMutationRateLimitAuditPasses,
  auditApiMutationRateLimit,
  API_MUTATION_RATE_LIMIT_AUDIT_POLICY_ID,
} from "@/scripts/lib/api-mutation-rate-limit-audit";

vi.mock("@/services/security/rate-limit-service", () => ({
  consumeRateLimitToken: vi.fn(async () => ({ ok: true as const })),
}));

describe("api mutation rate limit middleware", () => {
  it("detects mutation HTTP methods", () => {
    expect(isApiMutationMethod("POST")).toBe(true);
    expect(isApiMutationMethod("patch")).toBe(true);
    expect(isApiMutationMethod("GET")).toBe(false);
  });

  it("builds stable mutation scope keys", () => {
    expect(apiMutationScopeKey("/api/integrations/shopify/sync-products")).toBe(
      "mutation:integrations.shopify.sync-products",
    );
  });

  it("exempts webhooks and storefront/public API classes", () => {
    expect(isApiMutationRateLimitExempt("/api/webhooks/stripe")).toBe(true);
    expect(isApiMutationRateLimitExempt("/api/cron/webhook-jobs")).toBe(true);
    expect(isApiMutationRateLimitExempt("/api/storefront/cart")).toBe(true);
    expect(isApiMutationRateLimitExempt("/api/public/v1/orders")).toBe(true);
    expect(isApiMutationRateLimitExempt("/api/integrations/shopify/sync-products")).toBe(false);
  });

  it("returns null when enforceApiRateLimit passes", async () => {
    const response = await enforceApiRateLimitOrNull(
      new Request("https://example.com/api/accounting/ocr", { method: "POST" }),
      "mutation:accounting.ocr",
    );
    expect(response).toBeNull();
  });
});

describe("api mutation rate limit audit", () => {
  it("locks audit policy id", () => {
    expect(API_MUTATION_RATE_LIMIT_AUDIT_POLICY_ID).toBe("api-mutation-rate-limit-audit-v1");
  });

  it("covers dashboard mutation routes via middleware", () => {
    const report = auditApiMutationRateLimit(process.cwd());
    expect(report.mutationRoutes).toBeGreaterThanOrEqual(190);
    expect(report.middlewareCovered).toBeGreaterThanOrEqual(70);
    expect(report.middlewareCovered + report.dedicatedCovered).toBeGreaterThanOrEqual(90);
    assertApiMutationRateLimitAuditPasses(report);
  });

  it("wires middleware.ts mutation gate", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const middleware = readFileSync(join(process.cwd(), "middleware.ts"), "utf8");
    expect(middleware).toContain("enforceApiMutationRateLimitMiddleware");
  });
});
