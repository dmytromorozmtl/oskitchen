import { describe, expect, it } from "vitest";

import {
  buildRateLimitHeaders,
  computeResetAt,
  snapshotForPolicy,
} from "@/lib/rate-limit";

describe("lib/rate-limit facade", () => {
  it("builds X-RateLimit-* and Retry-After headers", () => {
    const snapshot = { limit: 120, remaining: 0, resetAt: 1_700_000_000 };
    const headers = buildRateLimitHeaders(snapshot, 15_000);

    expect(headers["X-RateLimit-Limit"]).toBe("120");
    expect(headers["X-RateLimit-Remaining"]).toBe("0");
    expect(headers["X-RateLimit-Reset"]).toBe("1700000000");
    expect(headers["Retry-After"]).toBe("15");
  });

  it("computes resetAt at next window boundary", () => {
    const windowMs = 60_000;
    const nowMs = 1_700_000_025_000;
    expect(computeResetAt(windowMs, nowMs)).toBe(Math.ceil((1_700_000_060_000) / 1000));
  });

  it("snapshotForPolicy sets remaining to zero when limited", () => {
    const snapshot = snapshotForPolicy(
      "public_api_v1_get",
      { ok: false, retryAfterMs: 30_000 },
      1_700_000_000_000,
    );
    expect(snapshot.limit).toBe(120);
    expect(snapshot.remaining).toBe(0);
  });
});
