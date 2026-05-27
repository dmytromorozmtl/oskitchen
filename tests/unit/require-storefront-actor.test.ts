import { beforeEach, describe, expect, it, vi } from "vitest";

import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const getStorefrontPermissionSetForUser = vi.hoisted(() => vi.fn());
const logStorefrontPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/services/storefront/storefront-permission-service", () => ({
  getStorefrontPermissionSetForUser,
}));

vi.mock("@/services/storefront/storefront-permission-audit", () => ({
  logStorefrontPermissionDenied,
}));

import {
  requireStorefrontMediaActor,
  requireStorefrontPublishActor,
} from "@/lib/storefront/require-storefront-actor";

describe("requireStorefrontPublishActor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies line cook without legacy publish and audits", async () => {
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
    getStorefrontPermissionSetForUser.mockResolvedValue({
      role: "STAFF",
      email: "cook@example.com",
      permissions: new Set(["storefront:view"]),
    });

    const access = await requireStorefrontPublishActor({ operation: "storefront.theme_publish" });

    expect(access.ok).toBe(false);
    expect(logStorefrontPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "storefront.publish",
        operation: "storefront.theme_publish",
      }),
    );
  });

  it("allows manager via canonical storefront.publish", async () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    const actor = {
      sessionUserId: "user-2",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "MANAGER" as const,
      email: "mgr@example.com",
      granted,
    };
    requireMutationPermission.mockResolvedValue({ ok: true, actor });

    const access = await requireStorefrontPublishActor();

    expect(access.ok).toBe(true);
    expect(getStorefrontPermissionSetForUser).not.toHaveBeenCalled();
  });

  it("allows staff with legacy publish flag when canonical is missing", async () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    const actor = {
      sessionUserId: "user-3",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "LINE_COOK" as const,
      email: "staff@example.com",
      granted,
    };
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor,
    });
    getStorefrontPermissionSetForUser.mockResolvedValue({
      role: "STAFF",
      email: "staff@example.com",
      permissions: new Set(["storefront:view", "storefront:publish"]),
    });

    const access = await requireStorefrontPublishActor();

    expect(access.ok).toBe(true);
  });
});

describe("requireStorefrontMediaActor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies line cook media mutations", async () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    const actor = {
      sessionUserId: "user-4",
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
    getStorefrontPermissionSetForUser.mockResolvedValue({
      role: "STAFF",
      email: "cook@example.com",
      permissions: new Set(["storefront:view"]),
    });

    const access = await requireStorefrontMediaActor({ operation: "storefront.media_upload" });

    expect(access.ok).toBe(false);
    expect(requireMutationPermission).toHaveBeenCalledWith("storefront.media.manage");
  });
});
