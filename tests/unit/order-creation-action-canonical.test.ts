import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const requireMutationPermission = vi.hoisted(() => vi.fn());
const createOrderViaCenter = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/scope/require-tenant-actor", () => ({ requireTenantActor }));
vi.mock("@/lib/auth", () => ({ requireUserProfile }));
vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/services/orders/order-creation-service", () => ({
  createOrderViaCenter,
}));

import { createOrderViaCenterAction } from "@/actions/order-creation";

describe("createOrderViaCenterAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "session-user" },
      dataUserId: "owner-1",
    });
    requireUserProfile.mockResolvedValue({
      id: "profile-1",
      role: "OWNER",
      email: "owner@example.com",
    });
    requireMutationPermission.mockResolvedValue({
      ok: true,
      actor: {
        sessionUserId: "session-user",
        userId: "owner-1",
        dataUserId: "owner-1",
        workspaceId: "ws-1",
        workspaceRole: "OWNER",
        staffRoleType: null,
        email: "owner@example.com",
        granted: new Set(["orders.manage"]),
      },
    });
  });

  it("routes dashboard order center submissions through the canonical service", async () => {
    createOrderViaCenter.mockResolvedValue({
      ok: false,
      error: "canonical stop",
    });

    const formData = new FormData();
    formData.set(
      "payload",
      JSON.stringify({
        orderType: "CUSTOM_ORDER",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        fulfillmentDetail: "PICKUP",
        lines: [{ title: "Test item", quantity: 1, unitPrice: 12 }],
      }),
    );

    const result = await createOrderViaCenterAction(formData);

    expect(result).toEqual({ ok: false, error: "canonical stop" });
    expect(createOrderViaCenter).toHaveBeenCalledWith(
      { userId: "owner-1", performedById: "profile-1" },
      expect.objectContaining({
        orderType: "CUSTOM_ORDER",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
      }),
    );
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
