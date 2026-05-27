import { beforeEach, describe, expect, it, vi } from "vitest";

const requireApiSession = vi.hoisted(() => vi.fn());
const requireBillingActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/with-api-guard", () => ({
  requireApiSession,
}));

vi.mock("@/lib/billing/require-billing-actor", () => ({
  requireBillingActor,
}));

import { requireBillingApiAccess } from "@/lib/billing/require-billing-api-access";

describe("requireBillingApiAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiSession.mockResolvedValue({
      ok: true,
      context: { userId: "session-1", email: "owner@example.com" },
    });
  });

  it("returns 403 response when billing actor gate fails", async () => {
    requireBillingActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to start checkout.",
    });

    const result = await requireBillingApiAccess("billing.checkout");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
    }
  });

  it("returns tenant user id when billing actor gate passes", async () => {
    requireBillingActor.mockResolvedValue({
      ok: true,
      actor: {},
      scope: {},
      userId: "owner-1",
      profileId: "profile-1",
    });

    const result = await requireBillingApiAccess("billing.checkout");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.userId).toBe("owner-1");
    }
  });
});
