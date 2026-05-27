import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  recipe: { findFirst: vi.fn() },
  ingredient: { updateMany: vi.fn() },
  posInventoryImpactEvent: { update: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/audit-log", () => ({ recordAuditLog: vi.fn() }));
vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  recipeListWhereForOwner: vi.fn(async () => ({ userId: "owner-1" })),
  ingredientListWhereForOwner: vi.fn(async () => ({ userId: "owner-1" })),
}));

import { recordAuditLog } from "@/lib/audit-log";
import { applyRecipeDepletionForPosLine } from "@/services/inventory/pos-recipe-depletion";

describe("applyRecipeDepletionForPosLine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => Promise<void>) =>
      fn(prismaMock),
    );
    prismaMock.ingredient.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.posInventoryImpactEvent.update.mockResolvedValue({});
  });

  it("returns pending when no recipe is configured", async () => {
    prismaMock.recipe.findFirst.mockResolvedValue(null);
    const result = await applyRecipeDepletionForPosLine(
      "owner-1",
      "ws-1",
      "impact-1",
      "product-1",
      2,
    );
    expect(result).toBe("pending");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(recordAuditLog).not.toHaveBeenCalled();
  });

  it("decrements stock and marks impact applied when recipe exists", async () => {
    prismaMock.recipe.findFirst.mockResolvedValue({
      id: "recipe-1",
      name: "Burger",
      yieldQuantity: 1,
      ingredients: [
        { ingredientId: "ing-1", quantity: 0.25, wastePercent: 0 },
      ],
    });

    const result = await applyRecipeDepletionForPosLine(
      "owner-1",
      "ws-1",
      "impact-1",
      "product-1",
      4,
    );

    expect(result).toBe("applied");
    expect(prismaMock.ingredient.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { currentStock: { decrement: 1 } },
      }),
    );
    expect(prismaMock.posInventoryImpactEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "APPLIED" }),
      }),
    );
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "inventory.pos_depletion_applied" }),
    );
  });
});
