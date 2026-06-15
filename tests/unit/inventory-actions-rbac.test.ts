import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const logWasteEvent = vi.hoisted(() => vi.fn());
const submitCountItem = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/services/inventory/waste-service", () => ({
  logWasteEvent,
}));

vi.mock("@/services/inventory/count-service", () => ({
  startInventoryCount: vi.fn(),
  submitCountItem,
  completeInventoryCount: vi.fn(),
}));

import { logWasteEventAction, submitCountItemAction } from "@/actions/inventory";

const INGREDIENT_ID = "11111111-1111-4111-8111-111111111111";
const COUNT_ITEM_ID = "22222222-2222-4222-8222-222222222222";

const deniedActor = {
  sessionUserId: "staff-1",
  userId: "owner-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("inventory actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logWasteEvent.mockResolvedValue(undefined);
    submitCountItem.mockResolvedValue(undefined);
  });

  it("denies logWasteEventAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("ingredientId", INGREDIENT_ID);
    formData.set("quantity", "2");
    formData.set("unit", "kg");
    formData.set("reason", "SPOILAGE");

    await expect(logWasteEventAction(formData)).rejects.toThrow("Forbidden");
    expect(requireMutationPermission).toHaveBeenCalledWith("production.manage");
    expect(logWasteEvent).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "staff-1",
        action: "inventory.permission_denied",
        metadata: expect.objectContaining({
          operation: "inventory.log_waste",
          requiredPermission: "production.manage",
        }),
      }),
    );
  });

  it("denies submitCountItemAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("countItemId", COUNT_ITEM_ID);
    formData.set("countedQty", "10");

    await expect(submitCountItemAction(formData)).rejects.toThrow("Forbidden");
    expect(submitCountItem).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "inventory.submit_count_item" }),
      }),
    );
  });

  it("allows logWasteEventAction when production.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("ingredientId", INGREDIENT_ID);
    formData.set("quantity", "2");
    formData.set("unit", "kg");
    formData.set("reason", "SPOILAGE");

    await logWasteEventAction(formData);

    expect(logWasteEvent).toHaveBeenCalledWith(
      "owner-1",
      expect.objectContaining({
        ingredientId: INGREDIENT_ID,
        quantity: 2,
        recordedById: "staff-1",
      }),
    );
  });
});
