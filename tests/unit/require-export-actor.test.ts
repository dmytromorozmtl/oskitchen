import { beforeEach, describe, expect, it, vi } from "vitest";

import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logExportPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/services/export/export-permission-audit", () => ({
  logExportPermissionDenied,
}));

import { requireExportActor } from "@/lib/import-export/require-export-actor";

describe("requireExportActor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies order export for line-cook staff and audits the denial", async () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    const actor = {
      sessionUserId: "user-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "LINE_COOK" as const,
      email: "cook@example.com",
      granted,
    };
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor,
    });

    const access = await requireExportActor({ exportType: "orders" });

    expect(access.ok).toBe(false);
    expect(requireMutationPermission).toHaveBeenCalledWith("orders.export");
    expect(logExportPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "orders.export",
        exportType: "orders",
      }),
    );
  });

  it("allows manager staff order export", async () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    const actor = {
      sessionUserId: "user-2",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "MANAGER" as const,
      email: "manager@example.com",
      granted,
    };
    requireMutationPermission.mockResolvedValue({ ok: true, actor });

    const access = await requireExportActor({ exportType: "orders" });

    expect(access.ok).toBe(true);
    expect(logExportPermissionDenied).not.toHaveBeenCalled();
  });
});
