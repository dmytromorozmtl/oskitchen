import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const createTransferOrder = vi.hoisted(() => vi.fn());
const logKitchenPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/lib/scope/require-tenant-actor", () => ({ requireTenantActor }));
vi.mock("@/services/commissary/transfer-service", () => ({ createTransferOrder }));
vi.mock("@/services/kitchen/kitchen-permission-audit", () => ({ logKitchenPermissionDenied }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createTransferAction } from "@/actions/commissary";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "VIEWER" as const,
  email: "viewer@example.com",
  granted: new Set<string>(),
};

describe("commissary actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logKitchenPermissionDenied.mockResolvedValue(undefined);
    requireTenantActor.mockResolvedValue({ dataUserId: "owner-1" });
    createTransferOrder.mockResolvedValue(undefined);
  });

  it("denies transfer creation without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("fromLocationId", "11111111-1111-4111-8111-111111111111");
    formData.set("toLocationId", "22222222-2222-4222-8222-222222222222");
    formData.set("ingredientId", "33333333-3333-4333-8333-333333333333");
    formData.set("quantity", "2");
    formData.set("unit", "kg");

    await createTransferAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("production.manage");
    expect(logKitchenPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({
        requiredPermission: "production.manage",
        operation: "commissary.transfer.create",
      }),
    );
    expect(createTransferOrder).not.toHaveBeenCalled();
  });

  it("creates transfer when production.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("fromLocationId", "11111111-1111-4111-8111-111111111111");
    formData.set("toLocationId", "22222222-2222-4222-8222-222222222222");
    formData.set("ingredientId", "33333333-3333-4333-8333-333333333333");
    formData.set("quantity", "2");
    formData.set("unit", "kg");

    await createTransferAction(formData);

    expect(createTransferOrder).toHaveBeenCalledTimes(1);
    expect(logKitchenPermissionDenied).not.toHaveBeenCalled();
  });
});
