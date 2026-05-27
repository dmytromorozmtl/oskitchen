import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logKitchenPermissionDenied = vi.hoisted(() => vi.fn());
const logKitchenOrderBumped = vi.hoisted(() => vi.fn());
const getDailyKdsOrders = vi.hoisted(() => vi.fn());
const updateOrderStatus = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/services/kitchen/kitchen-permission-audit", () => ({
  logKitchenPermissionDenied,
  logKitchenOrderBumped,
}));

vi.mock("@/services/kitchen-screen/daily-kds-service", () => ({
  getDailyKdsOrders,
}));

vi.mock("@/actions/orders", () => ({
  updateOrderStatus,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  bumpDailyKdsOrderAction,
  fetchDailyKdsOrdersAction,
} from "@/actions/kitchen-daily-kds";

const actor = {
  ok: true as const,
  actor: {
    sessionUser: { id: "session-user-1" },
    sessionUserId: "session-user-1",
    userId: "owner-user-1",
    dataUserId: "owner-user-1",
    workspaceId: "ws-1",
    email: "line@example.com",
    workspaceRole: "STAFF" as const,
    staffRoleType: "LINE_COOK" as const,
    granted: new Set(["kitchen.view", "kitchen.bump"]),
  },
};

describe("kitchen daily KDS RBAC actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logKitchenPermissionDenied.mockResolvedValue(undefined);
    logKitchenOrderBumped.mockResolvedValue(undefined);
    getDailyKdsOrders.mockResolvedValue([]);
    updateOrderStatus.mockResolvedValue({ ok: true });
  });

  it("denies fetch when kitchen.view is missing", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: actor.actor,
    });

    await expect(fetchDailyKdsOrdersAction()).resolves.toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
    });
    expect(logKitchenPermissionDenied).toHaveBeenCalledWith(actor.actor, {
      requiredPermission: "kitchen.view",
      operation: "kitchen.fetch_daily_orders",
      metadata: undefined,
    });
    expect(getDailyKdsOrders).not.toHaveBeenCalled();
  });

  it("bumps orders with kitchen.bump permission", async () => {
    requireMutationPermission.mockResolvedValue(actor);
    const orderId = "11111111-1111-4111-8111-111111111111";

    await expect(bumpDailyKdsOrderAction(orderId)).resolves.toEqual({ ok: true });

    expect(requireMutationPermission).toHaveBeenCalledWith("kitchen.bump");
    expect(updateOrderStatus).toHaveBeenCalledWith(orderId, "READY", {
      requiredPermission: "kitchen.bump",
    });
    expect(logKitchenOrderBumped).toHaveBeenCalledWith(actor.actor, { orderId });
  });

  it("denies bump when kitchen.bump is missing", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: actor.actor,
    });
    const orderId = "11111111-1111-4111-8111-111111111111";

    await expect(bumpDailyKdsOrderAction(orderId)).resolves.toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
    });
    expect(updateOrderStatus).not.toHaveBeenCalled();
    expect(logKitchenOrderBumped).not.toHaveBeenCalled();
  });
});
