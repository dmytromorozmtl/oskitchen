import { beforeEach, describe, expect, it, vi } from "vitest";

const platformUserRoleFindFirst = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    platformUserRole: { findFirst: platformUserRoleFindFirst },
  },
}));

import { isTargetSuperAdminProtected } from "@/lib/platform-admin";

describe("platform target superadmin protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not protect bootstrap email target without SUPER_ADMIN role row", async () => {
    platformUserRoleFindFirst.mockResolvedValue(null);

    await expect(isTargetSuperAdminProtected("target-1")).resolves.toBe(false);
    expect(platformUserRoleFindFirst).toHaveBeenCalledWith({
      where: { userId: "target-1", role: "SUPER_ADMIN" },
      select: { id: true },
    });
  });

  it("protects target when SUPER_ADMIN role row exists", async () => {
    platformUserRoleFindFirst.mockResolvedValue({ id: "role-1" });

    await expect(isTargetSuperAdminProtected("target-2")).resolves.toBe(true);
  });
});
