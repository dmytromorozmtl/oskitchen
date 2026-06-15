import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/products/menu-create-base", () => ({
  menuCreateBaseForOwner: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    menu: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { menuCreateBaseForOwner } from "@/lib/products/menu-create-base";
import { prisma } from "@/lib/prisma";
import { ensureCatalogMenu } from "@/lib/products/ensure-catalog-menu";

describe("ensureCatalogMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(menuCreateBaseForOwner).mockResolvedValue({
      userId: "owner-1",
      workspaceId: "ws-1",
    });
  });

  it("returns existing catalog menu scoped by workspaceId", async () => {
    vi.mocked(prisma.menu.findFirst).mockResolvedValue({ id: "menu-cat" } as never);
    const row = await ensureCatalogMenu("owner-1");
    expect(row).toEqual({ id: "menu-cat" });
    expect(prisma.menu.findFirst).toHaveBeenCalledWith({
      where: { workspaceId: "ws-1", catalogOnly: true },
    });
  });

  it("creates catalog menu with workspaceId", async () => {
    vi.mocked(menuCreateBaseForOwner).mockResolvedValue({
      userId: "owner-1",
      workspaceId: "ws-9",
    });
    vi.mocked(prisma.menu.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.menu.create).mockResolvedValue({ id: "new-cat" } as never);
    await ensureCatalogMenu("owner-1");
    expect(prisma.menu.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "owner-1",
          workspaceId: "ws-9",
          catalogOnly: true,
        }),
      }),
    );
  });

  it("throws when workspace is missing", async () => {
    vi.mocked(menuCreateBaseForOwner).mockRejectedValue(new Error("no workspace"));
    await expect(ensureCatalogMenu("owner-1")).rejects.toThrow(/no workspace/);
  });
});
