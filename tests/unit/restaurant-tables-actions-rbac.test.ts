import { beforeEach, describe, expect, it, vi } from "vitest";

const requireRestaurantTableMutation = vi.hoisted(() => vi.fn());
const createTable = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/restaurant/require-restaurant-table-mutation", () => ({
  requireRestaurantTableMutation,
}));

vi.mock("@/services/restaurant/table-service", () => ({
  createTable,
  updateTablePosition: vi.fn(),
  updateTableStatus: vi.fn(),
  deleteTable: vi.fn(),
}));

import { createRestaurantTable } from "@/actions/restaurant/tables";

const ownerActor = {
  sessionUserId: "owner-1",
  userId: "owner-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "OWNER" as const,
  staffRoleType: "OWNER" as const,
  email: "owner@example.com",
  granted: new Set(["pos.access"]),
  platformBypass: false,
  sessionUser: { id: "owner-1", email: "owner@example.com" },
};

describe("restaurant tables actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTable.mockResolvedValue({
      id: "tbl-1",
      name: "T1",
      section: null,
      capacity: 4,
      status: "AVAILABLE",
      shape: "ROUND",
      positionX: 0,
      positionY: 0,
      width: 80,
      height: 80,
    });
  });

  it("denies create without pos.access", async () => {
    requireRestaurantTableMutation.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const formData = new FormData();
    formData.set("name", "Table 1");
    formData.set("capacity", "4");

    const result = await createRestaurantTable(formData);

    expect(result.ok).toBe(false);
    expect(requireRestaurantTableMutation).toHaveBeenCalledWith({
      operation: "restaurant_tables.create",
    });
    expect(createTable).not.toHaveBeenCalled();
  });

  it("allows create when pos.access gate passes", async () => {
    requireRestaurantTableMutation.mockResolvedValue({ ok: true, actor: ownerActor });

    const formData = new FormData();
    formData.set("name", "Table 1");
    formData.set("capacity", "4");

    const result = await createRestaurantTable(formData);

    expect(result.ok).toBe(true);
    expect(createTable).toHaveBeenCalledWith("owner-1", expect.objectContaining({ name: "Table 1" }));
  });
});
