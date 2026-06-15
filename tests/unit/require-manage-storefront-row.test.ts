import { beforeEach, describe, expect, it, vi } from "vitest";

const requireStorefrontManageActor = vi.hoisted(() => vi.fn());
const requireSessionUser = vi.hoisted(() => vi.fn());
const resolveStorefrontAdminAccess = vi.hoisted(() => vi.fn());
const prismaFindUnique = vi.hoisted(() => vi.fn());

vi.mock("@/lib/storefront/require-storefront-actor", () => ({
  requireStorefrontManageActor,
}));
vi.mock("@/lib/auth", () => ({
  requireSessionUser,
}));
vi.mock("@/lib/storefront/storefront-admin-access", () => ({
  resolveStorefrontAdminAccess,
  requireStorefrontAdminPermission: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    storefrontSettings: {
      findUnique: prismaFindUnique,
    },
  },
}));

import { requireManageStorefrontRow } from "@/lib/storefront/require-admin-storefront";

describe("requireManageStorefrontRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSessionUser.mockResolvedValue({ id: "staff-1" });
    requireStorefrontManageActor.mockResolvedValue({
      ok: true,
      actor: { sessionUserId: "staff-1" },
    });
    resolveStorefrontAdminAccess.mockResolvedValue({
      ok: true,
      isOwner: false,
      workspaceRole: "STAFF",
      permissions: ["storefront.catalog"],
      storefront: {
        id: "sf-1",
        storeSlug: "demo",
        userId: "owner-1",
        workspaceId: "ws-1",
      },
    });
    prismaFindUnique.mockResolvedValue({ id: "sf-1", storeSlug: "demo" });
  });

  it("loads the active storefront row when canonical storefront.manage is granted", async () => {
    const { sf } = await requireManageStorefrontRow(
      { id: true, storeSlug: true },
      { operation: "storefront.page.create" },
    );

    expect(requireStorefrontManageActor).toHaveBeenCalledWith({
      operation: "storefront.page.create",
    });
    expect(sf).toEqual({ id: "sf-1", storeSlug: "demo" });
    expect(prismaFindUnique).toHaveBeenCalledWith({
      where: { id: "sf-1" },
      select: { id: true, storeSlug: true },
    });
  });

  it("throws when storefront.manage is denied", async () => {
    requireStorefrontManageActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    await expect(requireManageStorefrontRow({ id: true })).rejects.toThrow(
      "You do not have permission to perform this action.",
    );
    expect(resolveStorefrontAdminAccess).not.toHaveBeenCalled();
  });
});
