import { beforeEach, describe, expect, it, vi } from "vitest";

const requireSessionOrIngestBearer = vi.hoisted(() => vi.fn());
const consumeRateLimitToken = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/public-post-guard", () => ({
  requireSessionOrIngestBearer,
}));

vi.mock("@/services/security/rate-limit-service", () => ({
  consumeRateLimitToken,
}));

vi.mock("@/lib/growth/growth-notify", () => ({
  notifyGrowthInbound: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appFeedback: { create: vi.fn() },
  },
}));

import { POST } from "@/app/api/nps/route";

describe("NPS route fail-closed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consumeRateLimitToken.mockResolvedValue({ ok: true });
  });

  it("returns guard response when neither session nor ingest secret is configured", async () => {
    requireSessionOrIngestBearer.mockResolvedValue({
      ok: false,
      response: new Response(
        JSON.stringify({ ok: false, error: "NPS feedback ingest not configured" }),
        { status: 503 },
      ),
    });

    const response = await POST(
      new Request("http://localhost/api/nps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: 9 }),
      }),
    );

    expect(response.status).toBe(503);
  });

  it("returns 400 for invalid payload after auth passes", async () => {
    requireSessionOrIngestBearer.mockResolvedValue({ ok: true, userId: "user-1" });

    const response = await POST(
      new Request("http://localhost/api/nps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: 99 }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
