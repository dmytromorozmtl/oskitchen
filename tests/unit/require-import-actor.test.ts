import { beforeEach, describe, expect, it, vi } from "vitest";

import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logImportPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/services/import-export/import-permission-audit", () => ({
  logImportPermissionDenied,
}));

import { requireImportActor } from "@/lib/import-export/require-import-actor";

describe("requireImportActor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies ingredient import for line-cook staff and audits the denial", async () => {
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

    const access = await requireImportActor({ importKind: "ingredients" });

    expect(access.ok).toBe(false);
    expect(requireMutationPermission).toHaveBeenCalledWith("products.edit");
    expect(logImportPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "products.edit",
        importKind: "ingredients",
      }),
    );
  });
});
