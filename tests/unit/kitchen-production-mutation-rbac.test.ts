import { beforeEach, describe, expect, it, vi } from "vitest";

const requireKitchenMutationAccess = vi.hoisted(() => vi.fn());
const logKitchenPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/kitchen/require-kitchen-mutation-access", () => ({
  requireKitchenMutationAccess,
}));

vi.mock("@/services/kitchen/kitchen-permission-audit", () => ({
  logKitchenPermissionDenied,
}));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission: vi.fn(),
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    productionWorkItem: { findFirst: vi.fn(), update: vi.fn() },
    productionWorkEvent: { create: vi.fn() },
  },
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("date-fns", () => ({
  format: () => "2026-01-01",
}));

import { updateProductionWorkItemStatusFormAction } from "@/actions/production";

const actor = {
  ok: true as const,
  actor: {
    sessionUser: { id: "session-user-1" },
    sessionUserId: "session-user-1",
    userId: "owner-user-1",
    workspaceId: "ws-1",
    email: "lead@example.com",
    workspaceRole: "STAFF" as const,
    staffRoleType: "KITCHEN_LEAD" as const,
    granted: new Set(["kitchen.view", "kitchen.expo.manage"]),
  },
};

describe("kitchen production work-item RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logKitchenPermissionDenied.mockResolvedValue(undefined);
  });

  it("requires kitchen.expo.manage for pack handoff transitions", async () => {
    requireKitchenMutationAccess.mockResolvedValue(actor);

    const fd = new FormData();
    fd.set("workItemId", "11111111-1111-4111-8111-111111111111");
    fd.set("status", "PACK_HANDOFF");

    await updateProductionWorkItemStatusFormAction(fd);

    expect(requireKitchenMutationAccess).toHaveBeenCalledWith("kitchen.expo.manage");
  });

  it("audits denial when pack handoff is unauthorized", async () => {
    requireKitchenMutationAccess.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: actor.actor,
    });

    const fd = new FormData();
    fd.set("workItemId", "11111111-1111-4111-8111-111111111111");
    fd.set("status", "PACK_HANDOFF");

    await updateProductionWorkItemStatusFormAction(fd);

    expect(logKitchenPermissionDenied).toHaveBeenCalledWith(
      actor.actor,
      expect.objectContaining({
        requiredPermission: "kitchen.expo.manage",
        operation: "kitchen.update_work_item_status",
      }),
    );
  });
});
