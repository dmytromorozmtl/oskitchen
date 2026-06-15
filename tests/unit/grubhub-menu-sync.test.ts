import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    menu: { findMany },
  },
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  menuListWhereForOwner: vi.fn(async () => ({ userId: "owner-1" })),
}));

import { buildGrubhubMenuPayload } from "@/services/integrations/grubhub/menu-sync.service";

describe("grubhub menu sync", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("builds sections from active menus with prices in cents", async () => {
    findMany.mockResolvedValue([
      {
        id: "menu-1",
        title: "Dinner",
        products: [
          {
            id: "prod-1",
            title: "Pasta",
            description: "Marinara",
            price: 14.99,
            active: true,
          },
        ],
      },
    ]);

    const payload = await buildGrubhubMenuPayload("owner-1");
    expect(payload.sections).toHaveLength(1);
    expect(payload.sections[0]?.name).toBe("Dinner");
    expect(payload.sections[0]?.items[0]).toEqual({
      external_id: "prod-1",
      name: "Pasta",
      description: "Marinara",
      price: 1499,
      available: true,
    });
  });

  it("filters payload to a single menu when menuId is provided", async () => {
    findMany.mockResolvedValue([]);

    await buildGrubhubMenuPayload("owner-1", { menuId: "menu-target" });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: expect.arrayContaining([{ id: "menu-target" }]),
        },
        take: 1,
      }),
    );
  });
});
