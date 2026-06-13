import { describe, expect, it, vi } from "vitest";

import {
  apiMutationScopeKey,
  enforceApiMutationRateLimitMiddleware,
  enforceApiRateLimitOrNull,
  isApiMutationMiddlewareCovered,
  isApiMutationRateLimitExempt,
  isApiMutationMethod,
  webhookProviderScopeFromPathname,
} from "@/lib/api/middleware-api-rate-limit";
import { withApiMutationRateLimit } from "@/lib/api/with-api-mutation-rate-limit";
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

  it("exempts webhooks from generic api_mutation but covers via middleware webhook IP gate", () => {
    expect(isApiMutationRateLimitExempt("/api/webhooks/stripe")).toBe(true);
    expect(isApiMutationMiddlewareCovered("/api/webhooks/stripe")).toBe(true);
    expect(isApiMutationRateLimitExempt("/api/cron/webhook-jobs")).toBe(true);
    expect(isApiMutationMiddlewareCovered("/api/cron/webhook-jobs")).toBe(false);
    expect(isApiMutationRateLimitExempt("/api/storefront/cart")).toBe(true);
    expect(isApiMutationRateLimitExempt("/api/public/v1/orders")).toBe(true);
    expect(isApiMutationRateLimitExempt("/api/integrations/shopify/sync-products")).toBe(false);
    expect(isApiMutationMiddlewareCovered("/api/integrations/shopify/sync-products")).toBe(true);
  });

  it("builds webhook provider scope keys", () => {
    expect(webhookProviderScopeFromPathname("/api/webhooks/doordash/orders")).toBe(
      "doordash.orders",
    );
    expect(webhookProviderScopeFromPathname("/api/webhooks/shopify/orders-create")).toBe(
      "shopify.orders-create",
    );
  });

  it("withApiMutationRateLimit passes through when limit ok", async () => {
    const handler = withApiMutationRateLimit(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const res = await handler(
      new Request("https://example.com/api/pos/terminal", { method: "POST" }),
    );
    expect(res.status).toBe(200);
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

  it("covers dashboard and webhook mutation routes via middleware", () => {
    const report = auditApiMutationRateLimit(process.cwd());
    expect(report.mutationRoutes).toBeGreaterThanOrEqual(190);
    expect(report.middlewareCovered).toBeGreaterThanOrEqual(120);
    expect(report.middlewareCovered + report.dedicatedCovered).toBeGreaterThanOrEqual(140);
    expect(report.middlewareCovered + report.dedicatedCovered + report.exemptClass).toBe(
      report.mutationRoutes,
    );
    assertApiMutationRateLimitAuditPasses(report);

    const webhookRows = report.rows.filter((row) => row.routePath.startsWith("/api/webhooks/"));
    expect(webhookRows.length).toBeGreaterThanOrEqual(40);
    expect(webhookRows.every((row) => row.coverage === "middleware" || row.coverage === "dedicated")).toBe(
      true,
    );
  });

  it("wires middleware.ts mutation gate including webhook IP limit", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const middleware = readFileSync(join(process.cwd(), "middleware.ts"), "utf8");
    expect(middleware).toContain("enforceApiMutationRateLimitMiddleware");
    const blocked = await enforceApiMutationRateLimitMiddleware({
      nextUrl: new URL("https://example.com/api/webhooks/doordash/orders?cid=x"),
      method: "POST",
      headers: new Headers(),
    } as import("next/server").NextRequest);
    expect(blocked).toBeNull();
  });

  it("registers audit npm script and deploy-prod-gate CI step", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const {
      API_MUTATION_RATE_LIMIT_AUDIT_NPM_SCRIPT,
      API_MUTATION_RATE_LIMIT_CI_NPM_SCRIPT,
      API_MUTATION_RATE_LIMIT_CI_WORKFLOW,
    } = await import("@/lib/qa/api-mutation-rate-limit-policy");

    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[API_MUTATION_RATE_LIMIT_AUDIT_NPM_SCRIPT]).toContain(
      "audit-api-mutation-rate-limit.ts",
    );
    expect(pkg.scripts?.[API_MUTATION_RATE_LIMIT_CI_NPM_SCRIPT]).toContain(
      "api-mutation-rate-limit.test.ts",
    );

    const workflow = readFileSync(join(process.cwd(), API_MUTATION_RATE_LIMIT_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:api-mutation-rate-limit");
  });
});
