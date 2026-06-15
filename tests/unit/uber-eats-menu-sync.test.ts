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

import { buildUberEatsMenuPayload } from "@/services/integrations/uber-eats/menu-sync.service";

describe("uber eats menu sync", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("builds categories with entity prices in cents", async () => {
    findMany.mockResolvedValue([
      {
        id: "menu-1",
        title: "Dinner",
        products: [
          {
            id: "prod-1",
            title: "Pasta",
            description: "Fresh",
            price: 14,
            active: true,
          },
        ],
      },
    ]);

    const payload = await buildUberEatsMenuPayload("owner-1");
    expect(payload.categories[0]?.entities[0]).toEqual({
      id: "prod-1",
      title: "Pasta",
      description: "Fresh",
      price: 1400,
    });
  });

  it("filters payload to a single menu when menuId is provided", async () => {
    findMany.mockResolvedValue([]);

    await buildUberEatsMenuPayload("owner-1", { menuId: "menu-target" });

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
