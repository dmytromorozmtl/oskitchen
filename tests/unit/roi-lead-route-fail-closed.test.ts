import { beforeEach, describe, expect, it, vi } from "vitest";

const enforcePublicMarketingPostGuard = vi.hoisted(() => vi.fn());
const betaLeadCreate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/public-post-guard", () => ({
  enforcePublicMarketingPostGuard,
}));

vi.mock("@/lib/growth/growth-notify", () => ({
  notifyGrowthInbound: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    betaLead: { create: betaLeadCreate },
  },
}));

import { POST } from "@/app/api/leads/roi/route";

describe("ROI lead route fail-closed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    betaLeadCreate.mockResolvedValue({ id: "lead-1" });
  });

  it("returns guard response when marketing post guard rejects request", async () => {
    enforcePublicMarketingPostGuard.mockResolvedValue(
      new Response(JSON.stringify({ ok: false, error: "Lead capture not configured" }), {
        status: 503,
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/leads/roi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "lead@example.com" }),
      }),
    );

    expect(response.status).toBe(503);
    expect(betaLeadCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid payload after guard passes", async () => {
    enforcePublicMarketingPostGuard.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/leads/roi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-an-email" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(betaLeadCreate).not.toHaveBeenCalled();
  });
});
