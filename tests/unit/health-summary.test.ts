import { describe, expect, it } from "vitest";

import { summariseHealthPayload } from "@/lib/ops/health-summary";

describe("health summary", () => {
  it("summarises a healthy payload", () => {
    const summary = summariseHealthPayload({
      status: "ok",
      checks: {
        database: { ok: true, latencyMs: 123 },
        rateLimitAdapter: { mode: "upstash" },
        startupReadiness: { ok: true },
      },
    });

    expect(summary.ok).toBe(true);
    expect(summary.databaseOk).toBe(true);
    expect(summary.databaseLatencyMs).toBe(123);
    expect(summary.rateLimitMode).toBe("upstash");
    expect(summary.startupReadinessOk).toBe(true);
    expect(summary.lines).toContain("status=ok");
  });

  it("handles malformed payloads safely", () => {
    const summary = summariseHealthPayload("not-json");

    expect(summary.ok).toBe(false);
    expect(summary.status).toBeNull();
    expect(summary.databaseOk).toBeNull();
    expect(summary.rateLimitMode).toBeNull();
    expect(summary.lines).toContain("status=unknown");
  });
});
