import { expect, test } from "@playwright/test";

test.describe("Public health API", () => {
  test("GET /api/health returns JSON with status and checks", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok() || res.status() === 503).toBeTruthy();
    const json = (await res.json()) as {
      status?: string;
      checks?: {
        database?: { ok?: boolean };
        observability?: { backend?: string; configured?: boolean; sentryConnected?: boolean };
        sentryServer?: { ok?: boolean; configured?: boolean; status?: string } | string;
        rateLimitAdapter?: { adapter?: string; ok?: boolean } | string;
      };
    };
    expect(json.status === "ok" || json.status === "degraded").toBeTruthy();
    expect(json.checks?.database).toBeDefined();
    const observability = json.checks?.observability;
    if (observability) {
      expect(["NONE", "SENTRY", "OTEL"]).toContain(observability.backend);
    }
    const sentry = json.checks?.sentryServer;
    if (typeof sentry === "string") {
      expect(sentry).toMatch(/not_configured|live|dsn_uninitialized/);
    } else {
      expect(sentry).toEqual(expect.objectContaining({ ok: expect.any(Boolean) }));
      if (sentry?.status) {
        expect(sentry.status).toMatch(/not_configured|live|dsn_uninitialized/);
      }
    }
    const rateLimit = json.checks?.rateLimitAdapter;
    const adapter =
      typeof rateLimit === "string" ? rateLimit : (rateLimit?.adapter ?? "");
    expect(["memory", "upstash", "redis"]).toContain(adapter);
  });
});
