import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { count: vi.fn().mockResolvedValue(0) },
    nutritionProfile: { count: vi.fn().mockResolvedValue(0) },
    allergenProfile: { count: vi.fn().mockResolvedValue(0) },
    ingredientDeclaration: { count: vi.fn().mockResolvedValue(0) },
    printedLabel: { count: vi.fn().mockResolvedValue(0) },
  },
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  productListWhereForOwnerAnd: vi.fn().mockResolvedValue({
    workspaceId: "ws-1",
    active: true,
  }),
}));

vi.mock("@/lib/scope/workspace-printed-label-scope", () => ({
  printedLabelListWhereForOwnerAnd: vi.fn().mockResolvedValue({
    OR: [
      { product: { workspaceId: "ws-1" } },
      { order: { workspaceId: "ws-1" } },
      { productId: null, orderId: null, userId: "owner-1" },
    ],
    status: "QUEUED",
  }),
}));

import { prisma } from "@/lib/prisma";
import { getLabelCommandCenterStats } from "@/services/nutrition-labels/command-center-stats";

describe("getLabelCommandCenterStats", () => {
  it("scopes nutrition profile counts via active product workspace filter", async () => {
    await getLabelCommandCenterStats("owner-1");

    const nutritionCalls = vi.mocked(prisma.nutritionProfile.count).mock.calls;
    expect(nutritionCalls.length).toBeGreaterThan(0);
    for (const [arg] of nutritionCalls) {
      expect(arg?.where).toMatchObject({
        product: expect.objectContaining({
          workspaceId: "ws-1",
          active: true,
        }),
      });
      expect(arg?.where).not.toHaveProperty("userId");
    }

    const labelCalls = vi.mocked(prisma.printedLabel.count).mock.calls;
    expect(labelCalls.length).toBe(2);
    for (const [arg] of labelCalls) {
      expect(arg?.where).toMatchObject({
        OR: expect.arrayContaining([
          expect.objectContaining({ product: expect.any(Object) }),
        ]),
      });
      expect(arg?.where).not.toMatchObject({ userId: "owner-1" });
    }
  });
});
