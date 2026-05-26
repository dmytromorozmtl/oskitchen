import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    posTab: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    productionPlanTask: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    pickupWindow: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  ownerScopedAnd: vi.fn(),
  posTabListWhereForOwner: vi.fn(),
  productionPlanTaskListWhereForOwner: vi.fn(),
  pickupWindowListWhereForOwner: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { ownerScopedAnd } from "@/lib/scope/workspace-resource-scope";
import { createTab } from "@/services/pos/tab-service";
import { getProductionCalendar } from "@/services/production/production-calendar-service";
import { getAvailablePickupWindows } from "@/services/storefront/pickup-slots";

describe("hot-path scoped services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    vi.mocked(ownerScopedAnd).mockResolvedValue({
      AND: [{ workspaceId: "ws-1" }, { status: "OPEN" }],
    });
  });

  it("createTab sets workspaceId on create", async () => {
    vi.mocked(prisma.posTab.create).mockResolvedValue({ id: "tab-1" } as never);
    await createTab("owner-1", "Table 1");
    expect(prisma.posTab.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "owner-1",
        workspaceId: "ws-1",
        name: "Table 1",
      }),
    });
  });

  it("getProductionCalendar uses ownerScopedAnd filter", async () => {
    vi.mocked(prisma.productionPlanTask.findMany).mockResolvedValue([]);
    const week = new Date("2026-05-19T12:00:00Z");
    await getProductionCalendar("owner-1", week);
    expect(ownerScopedAnd).toHaveBeenCalledWith("owner-1", expect.objectContaining({ planDate: expect.any(Object) }));
    expect(prisma.productionPlanTask.findMany).toHaveBeenCalled();
  });

  it("getAvailablePickupWindows scopes by owner", async () => {
    vi.mocked(prisma.pickupWindow.findMany).mockResolvedValue([]);
    await getAvailablePickupWindows("my-store", "owner-1");
    expect(ownerScopedAnd).toHaveBeenCalledWith(
      "owner-1",
      expect.objectContaining({ storeSlug: "my-store", active: true }),
    );
  });
});
