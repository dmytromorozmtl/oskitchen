import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

import { requireMutationPermission } from "@/lib/permissions/mutation-access";

function actorFor(
  role:
    | { workspaceRole: "OWNER"; staffRoleType: null; granted: ReadonlySet<string> }
    | { workspaceRole: "STAFF"; staffRoleType: "CUSTOMER_SERVICE" | "MANAGER"; granted: ReadonlySet<string> },
) {
  return {
    sessionUser: { id: "session-user-1" },
    sessionUserId: "session-user-1",
    userId: "owner-user-1",
    dataUserId: "owner-user-1",
    workspaceId: "ws-1",
    email: "staff@example.com",
    ...role,
  };
}

describe("POS mutation-access role matrix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets customer-service staff checkout but blocks manager-only POS mutations", async () => {
    const actor = actorFor({
      workspaceRole: "STAFF",
      staffRoleType: "CUSTOMER_SERVICE",
      granted: workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF"),
    });
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    await expect(requireMutationPermission("pos.checkout")).resolves.toEqual({ ok: true, actor });
    await expect(requireMutationPermission("pos.refund")).resolves.toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor,
    });
    await expect(requireMutationPermission("pos.void")).resolves.toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor,
    });
    await expect(requireMutationPermission("pos.register.manage")).resolves.toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor,
    });
    await expect(requireMutationPermission("pos.hardware.manage")).resolves.toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor,
    });
    await expect(requireMutationPermission("pos.shift.close")).resolves.toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor,
    });
  });

  it("grants manager staff templates the canonical manager-only POS mutation bundle", async () => {
    const actor = actorFor({
      workspaceRole: "STAFF",
      staffRoleType: "MANAGER",
      granted: workspacePermissionsFromStaffTemplate("MANAGER", "STAFF"),
    });
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    for (const required of [
      "pos.checkout",
      "pos.discount.apply",
      "pos.refund",
      "pos.void",
      "pos.register.manage",
      "pos.hardware.manage",
      "pos.shift.open",
      "pos.shift.close",
    ] as const) {
      await expect(requireMutationPermission(required)).resolves.toEqual({ ok: true, actor });
    }
  });

  it("keeps owner actors allowed across the full POS mutation bundle", async () => {
    const actor = actorFor({
      workspaceRole: "OWNER",
      staffRoleType: null,
      granted: defaultPermissionsForWorkspaceRole("OWNER"),
    });
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    for (const required of [
      "pos.access",
      "pos.checkout",
      "pos.discount.apply",
      "pos.refund",
      "pos.void",
      "pos.register.manage",
      "pos.hardware.manage",
      "pos.shift.open",
      "pos.shift.close",
    ] as const) {
      await expect(requireMutationPermission(required)).resolves.toEqual({ ok: true, actor });
    }
  });

  it("returns a generic denial when the workspace permission actor cannot be loaded", async () => {
    requireWorkspacePermissionActor.mockRejectedValue(new Error("session missing"));

    await expect(requireMutationPermission("pos.checkout")).resolves.toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
    });
  });
});
