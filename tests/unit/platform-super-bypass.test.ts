import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaFindFirst = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    platformUserRole: {
      findFirst: prismaFindFirst,
    },
  },
}));

import { hasSuperAdminRoleRow, isSuperAdminUser } from "@/lib/platform-super-bypass";
import { isBootstrapPlatformRootEmail, isSuperAdminEmail } from "@/lib/platform-owner";

describe("platform superadmin runtime authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not grant runtime access from bootstrap email alone", async () => {
    prismaFindFirst.mockResolvedValue(null);

    await expect(isSuperAdminUser("user-1", "workspace.moroz@gmail.com")).resolves.toBe(false);
    expect(prismaFindFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", role: "SUPER_ADMIN" },
      select: { id: true },
    });
  });

  it("grants runtime access when SUPER_ADMIN role row exists", async () => {
    prismaFindFirst.mockResolvedValue({ id: "role-1" });

    await expect(isSuperAdminUser("user-2", "operator@example.com")).resolves.toBe(true);
    await expect(hasSuperAdminRoleRow("user-2")).resolves.toBe(true);
  });

  it("keeps bootstrap email helper separate from runtime authorization", () => {
    expect(isBootstrapPlatformRootEmail("workspace.moroz@gmail.com")).toBe(true);
    expect(isSuperAdminEmail("workspace.moroz@gmail.com")).toBe(true);
    expect(isBootstrapPlatformRootEmail("operator@example.com")).toBe(false);
  });
});
