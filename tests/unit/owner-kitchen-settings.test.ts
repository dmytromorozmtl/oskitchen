import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenSettings: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";

describe("findOwnerKitchenSettings", () => {
  it("queries by owner userId", async () => {
    vi.mocked(prisma.kitchenSettings.findUnique).mockResolvedValue({
      businessType: "MEAL_PREP",
    } as never);

    const row = await findOwnerKitchenSettings("owner-1", { businessType: true });
    expect(row?.businessType).toBe("MEAL_PREP");
    expect(prisma.kitchenSettings.findUnique).toHaveBeenCalledWith({
      where: { userId: "owner-1" },
      select: { businessType: true },
    });
  });
});
