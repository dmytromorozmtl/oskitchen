import { beforeEach, describe, expect, it, vi } from "vitest";

const requireSessionUser = vi.hoisted(() => vi.fn());
const ensurePlatformOwnerBootstrap = vi.hoisted(() => vi.fn());
const isPlatformAdmin = vi.hoisted(() => vi.fn());
const getPlatformRolesForUser = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  requireSessionUser,
}));

vi.mock("@/lib/platform-admin", () => ({
  ensurePlatformOwnerBootstrap,
  isPlatformAdmin,
  getPlatformRolesForUser,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { requirePlatformAccess } from "@/lib/platform/platform-guards";

describe("platform guards founder flag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSessionUser.mockResolvedValue({
      id: "user-1",
      email: "workspace.moroz@gmail.com",
    });
    ensurePlatformOwnerBootstrap.mockResolvedValue(undefined);
    isPlatformAdmin.mockResolvedValue(true);
  });

  it("does not set isFounder from bootstrap email alone", async () => {
    getPlatformRolesForUser.mockResolvedValue(["PLATFORM_ADMIN"]);

    const ctx = await requirePlatformAccess();

    expect(ctx.isFounder).toBe(false);
    expect(ctx.roles).toEqual(["PLATFORM_ADMIN"]);
  });

  it("sets isFounder when SUPER_ADMIN role row is present", async () => {
    getPlatformRolesForUser.mockResolvedValue(["SUPER_ADMIN"]);

    const ctx = await requirePlatformAccess();

    expect(ctx.isFounder).toBe(true);
    expect(ctx.permissions.has("platform:dangerous-actions:run")).toBe(true);
  });
});
