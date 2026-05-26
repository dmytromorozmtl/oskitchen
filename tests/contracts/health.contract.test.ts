import { describe, expect, it } from "vitest";

import { healthResponseSchema } from "@/lib/api/health-contract";

describe("GET /api/health contract", () => {
  it("accepts observability extended fields", () => {
    const sample = {
      status: "ok" as const,
      timestamp: new Date().toISOString(),
      version: "abc1234",
      checks: {
        database: { ok: true, latencyMs: 120 },
        observability: {
          ok: true,
          backend: "SENTRY",
          configured: true,
          sentryConnected: true,
          version: "abc1234",
        },
        sentryServer: {
          ok: true,
          configured: true,
          status: "live",
        },
      },
    };
    expect(healthResponseSchema.safeParse(sample).success).toBe(true);
  });
});
