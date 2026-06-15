import { beforeEach, describe, expect, it, vi } from "vitest";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const getStorefrontPermissionSetForUser = vi.hoisted(() => vi.fn());
const logStorefrontPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/components/dashboard/pos-access-card", () => ({
  PosAccessCard: () => null,
}));

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

vi.mock("@/services/storefront/storefront-permission-service", () => ({
  getStorefrontPermissionSetForUser,
}));

vi.mock("@/services/storefront/storefront-permission-audit", () => ({
  logStorefrontPermissionDenied,
}));

import { requireStorefrontReadPage, resolveStorefrontHubAccess } from "@/lib/storefront/storefront-page-access";

describe("storefront read page access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logStorefrontPermissionDenied.mockResolvedValue(undefined);
  });

  it("denies hub access without storefront.read or legacy view", async () => {
    const actor = {
      sessionUserId: "staff-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      email: "viewer@example.com",
      workspaceRole: "STAFF" as const,
      staffRoleType: "VIEWER" as const,
      granted: new Set(["workspace.view"]),
    };
    requireWorkspacePermissionActor.mockResolvedValue(actor);
    getStorefrontPermissionSetForUser.mockResolvedValue({
      permissions: new Set(),
      email: actor.email,
    });

    const access = await requireStorefrontReadPage({
      operation: "storefront.hub.layout",
      route: "/dashboard/storefront",
    });

    expect(access.ok).toBe(false);
    expect(logStorefrontPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({ requiredPermission: "storefront.read" }),
    );
  });

  it("allows legacy storefront:view without canonical manage grants", async () => {
    const actor = {
      sessionUserId: "staff-2",
      userId: "owner-1",
      workspaceId: "ws-1",
      email: "staff@example.com",
      workspaceRole: "STAFF" as const,
      staffRoleType: "CUSTOMER_SERVICE" as const,
      granted: new Set(["workspace.view"]),
    };
    requireWorkspacePermissionActor.mockResolvedValue(actor);
    getStorefrontPermissionSetForUser.mockResolvedValue({
      permissions: new Set(["storefront:view"]),
      email: actor.email,
    });

    const hub = await resolveStorefrontHubAccess();
    expect(hub.canRead).toBe(true);
    expect(hub.canManage).toBe(false);
  });
});
