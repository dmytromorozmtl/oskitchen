import { beforeEach, describe, expect, it, vi } from "vitest";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const logMarketplacePermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/components/dashboard/pos-access-card", () => ({
  PosAccessCard: () => null,
}));

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

vi.mock("@/services/marketplace/marketplace-permission-audit", () => ({
  logMarketplacePermissionDenied,
}));

import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";

describe("marketplace page access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logMarketplacePermissionDenied.mockResolvedValue(undefined);
  });

  it("denies hub access without marketplace:read", async () => {
    requireWorkspacePermissionActor.mockResolvedValue({
      sessionUserId: "staff-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      email: "viewer@example.com",
      workspaceRole: "STAFF",
      staffRoleType: "VIEWER",
      granted: new Set(["workspace.view"]),
      platformBypass: false,
    });

    const access = await requireMarketplaceReadPage({
      operation: "marketplace.hub.layout",
      route: "/dashboard/marketplace",
    });

    expect(access.ok).toBe(false);
    expect(logMarketplacePermissionDenied).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: "ws-1" }),
      expect.objectContaining({ requiredPermission: "marketplace:read" }),
    );
  });

  it("allows owners with marketplace:read", async () => {
    requireWorkspacePermissionActor.mockResolvedValue({
      sessionUserId: "owner-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      email: "owner@example.com",
      workspaceRole: "OWNER",
      staffRoleType: null,
      granted: new Set(["marketplace:read", "marketplace:cart:write"]),
      platformBypass: false,
    });

    const access = await requireMarketplaceReadPage();
    expect(access.ok).toBe(true);
    if (access.ok) {
      expect(access.canRead).toBe(true);
      expect(access.canCartWrite).toBe(true);
    }
  });
});
