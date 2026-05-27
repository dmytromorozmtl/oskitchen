import { beforeEach, describe, expect, it, vi } from "vitest";

import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

import { requireMutationPermission } from "@/lib/permissions/mutation-access";

function actorFor(staffRoleType: "MANAGER" | "LINE_COOK" | "CUSTOMER_SERVICE") {
  return {
    sessionUser: { id: "session-user-1" },
    sessionUserId: "session-user-1",
    userId: "owner-user-1",
    dataUserId: "owner-user-1",
    workspaceId: "ws-1",
    email: "staff@example.com",
    workspaceRole: "STAFF" as const,
    staffRoleType,
    granted: workspacePermissionsFromStaffTemplate(staffRoleType, "STAFF"),
  };
}

describe("integrations mutation-access role matrix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("grants managers integrations.manage", async () => {
    const actor = actorFor("MANAGER");
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    await expect(requireMutationPermission("integrations.manage")).resolves.toEqual({
      ok: true,
      actor,
    });
  });

  it("grants customer service integrations.read but not manage", async () => {
    const actor = actorFor("CUSTOMER_SERVICE");
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    await expect(requireMutationPermission("integrations.read")).resolves.toEqual({
      ok: true,
      actor,
    });
    await expect(requireMutationPermission("integrations.manage")).resolves.toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor,
    });
  });

  it("blocks line cooks from integrations.manage", async () => {
    const actor = actorFor("LINE_COOK");
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    await expect(requireMutationPermission("integrations.manage")).resolves.toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor,
    });
  });
});
