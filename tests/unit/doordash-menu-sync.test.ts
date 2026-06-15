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

import { buildDoorDashMenuPayload } from "@/services/integrations/doordash/menu-sync.service";

describe("doordash menu sync", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("builds categories from active menus with prices in cents", async () => {
    findMany.mockResolvedValue([
      {
        id: "menu-1",
        title: "Lunch",
        products: [
          {
            id: "prod-1",
            title: "Burger",
            description: "Classic",
            price: 12.5,
            active: true,
          },
        ],
      },
    ]);

    const payload = await buildDoorDashMenuPayload("owner-1");
    expect(payload.categories).toHaveLength(1);
    expect(payload.categories[0]?.name).toBe("Lunch");
    expect(payload.categories[0]?.items[0]).toEqual({
      external_id: "prod-1",
      name: "Burger",
      description: "Classic",
      price: 1250,
      active: true,
    });
  });

  it("filters payload to a single menu when menuId is provided", async () => {
    findMany.mockResolvedValue([]);

    await buildDoorDashMenuPayload("owner-1", { menuId: "menu-target" });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [{ userId: "owner-1" }, { active: true }, { id: "menu-target" }],
        },
        take: 1,
      }),
    );
  });
});
