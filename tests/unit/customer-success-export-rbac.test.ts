import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const requireGrowthApiAccess = vi.hoisted(() => vi.fn());
const prismaFindMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/growth/require-growth-api-access", () => ({
  requireGrowthApiAccess,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findMany: prismaFindMany,
    },
  },
}));

import { GET } from "@/app/api/growth/customer-success/export/route";

describe("customer success export route RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaFindMany.mockResolvedValue([
      {
        email: "owner@example.com",
        fullName: "Owner",
        subscription: { plan: "PRO", status: "ACTIVE" },
        trialState: null,
        onboardingCompleted: true,
        _count: { orders: 12 },
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);
  });

  it("denies export without growth.manage", async () => {
    requireGrowthApiAccess.mockResolvedValue(
      NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    );

    const response = await GET();

    expect(requireGrowthApiAccess).toHaveBeenCalledWith("growth.manage");
    expect(response.status).toBe(403);
    expect(prismaFindMany).not.toHaveBeenCalled();
  });

  it("allows export when growth.manage is granted", async () => {
    requireGrowthApiAccess.mockResolvedValue(null);

    const response = await GET();

    expect(requireGrowthApiAccess).toHaveBeenCalledWith("growth.manage");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(prismaFindMany).toHaveBeenCalledTimes(1);
    const body = await response.text();
    expect(body).toContain("owner@example.com");
    expect(body).toContain("Owner");
  });
});
