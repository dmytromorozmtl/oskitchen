import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  ingredient: { updateMany: vi.fn() },
  wasteEvent: { create: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/audit-log", () => ({ recordAuditLog: vi.fn() }));
vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(async () => "ws-1"),
}));
vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  ingredientListWhereForOwner: vi.fn(async () => ({ userId: "owner-1" })),
  ownerScopedAnd: vi.fn(async (_uid: string, extra: object) => ({ AND: [{ userId: "owner-1" }, extra] })),
}));

import { recordAuditLog } from "@/lib/audit-log";
import { logWasteEvent } from "@/services/inventory/waste-service";

describe("logWasteEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => Promise<unknown>) =>
      fn(prismaMock),
    );
    prismaMock.ingredient.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.wasteEvent.create.mockResolvedValue({ id: "waste-1" });
  });

  it("decrements ingredient stock and writes audit log", async () => {
    await logWasteEvent("owner-1", {
      ingredientId: "ing-1",
      quantity: 2.5,
      unit: "lb",
      reason: "SPOILAGE",
      recordedById: "user-1",
    });

    expect(prismaMock.ingredient.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { currentStock: { decrement: 2.5 } },
      }),
    );
    expect(prismaMock.wasteEvent.create).toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "inventory.waste_logged" }),
    );
  });

  it("throws when ingredient is out of scope", async () => {
    prismaMock.ingredient.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      logWasteEvent("owner-1", {
        ingredientId: "ing-missing",
        quantity: 1,
        unit: "each",
        reason: "OTHER",
        recordedById: "user-1",
      }),
    ).rejects.toThrow("Ingredient not found");
    expect(prismaMock.wasteEvent.create).not.toHaveBeenCalled();
  });
});
