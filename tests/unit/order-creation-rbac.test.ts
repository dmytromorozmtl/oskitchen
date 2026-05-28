import { beforeEach, describe, expect, it, vi } from "vitest";

import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const createOrderViaCenter = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/lib/scope/require-tenant-actor", () => ({ requireTenantActor }));
vi.mock("@/lib/auth", () => ({ requireUserProfile }));
vi.mock("@/lib/audit-log", () => ({ recordAuditLog }));
vi.mock("@/services/orders/order-creation-service", () => ({ createOrderViaCenter }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createOrderViaCenterAction } from "@/actions/order-creation";
import { PLATFORM_ROOT_EMAIL } from "@/lib/platform-owner";

const validPayload = {
  orderType: "CUSTOM_ORDER",
  customerName: "Jane Doe",
  customerEmail: "jane@example.com",
  fulfillmentDetail: "PICKUP",
  lines: [{ title: "Test item", quantity: 1, unitPrice: 12 }],
};

describe("createOrderViaCenterAction RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordAuditLog.mockResolvedValue(undefined);
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "session-user" },
      dataUserId: "owner-1",
    });
    requireUserProfile.mockResolvedValue({
      id: "profile-1",
      role: "STAFF",
      email: PLATFORM_ROOT_EMAIL,
    });
  });

  it("denies order creation when orders.manage is missing even for bootstrap founder email", async () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: {
        sessionUserId: "session-user",
        userId: "owner-1",
        dataUserId: "owner-1",
        workspaceId: "ws-1",
        workspaceRole: "STAFF",
        staffRoleType: "LINE_COOK",
        email: PLATFORM_ROOT_EMAIL,
        granted,
      },
    });

    const formData = new FormData();
    formData.set("payload", JSON.stringify(validPayload));

    const result = await createOrderViaCenterAction(formData);

    expect(result).toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
    });
    expect(requireMutationPermission).toHaveBeenCalledWith("orders.manage");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(createOrderViaCenter).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "orders.permission_denied",
        metadata: expect.objectContaining({
          operation: "orders.create",
          requiredPermission: "orders.manage",
        }),
      }),
    );
  });

  it("allows order creation when actor has orders.manage", async () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    requireMutationPermission.mockResolvedValue({
      ok: true,
      actor: {
        sessionUserId: "session-user",
        userId: "owner-1",
        dataUserId: "owner-1",
        workspaceId: "ws-1",
        workspaceRole: "STAFF",
        staffRoleType: "MANAGER",
        email: "manager@example.com",
        granted,
      },
    });
    createOrderViaCenter.mockResolvedValue({
      ok: true,
      orderId: "order-1",
      lookupToken: "token-1",
    });

    const formData = new FormData();
    formData.set("payload", JSON.stringify(validPayload));

    const result = await createOrderViaCenterAction(formData);

    expect(result).toEqual({ ok: true, orderId: "order-1", lookupToken: "token-1" });
    expect(createOrderViaCenter).toHaveBeenCalledWith(
      { userId: "owner-1", performedById: "profile-1" },
      expect.objectContaining({ customerName: "Jane Doe" }),
    );
  });
});
