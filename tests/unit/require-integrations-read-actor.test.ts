import { beforeEach, describe, expect, it, vi } from "vitest";

import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const logIntegrationPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

vi.mock("@/services/integrations/integration-permission-audit", () => ({
  logIntegrationPermissionDenied,
}));

import { requireIntegrationsReadActor } from "@/lib/integrations/require-integrations-actor";

describe("requireIntegrationsReadActor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies line-cook staff and audits the denial", async () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    const actor = {
      sessionUserId: "cook-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "LINE_COOK" as const,
      email: "cook@example.com",
      granted,
    };
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    const access = await requireIntegrationsReadActor({ operation: "integrations.view_health" });

    expect(access.ok).toBe(false);
    expect(logIntegrationPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "integrations.read",
        operation: "integrations.view_health",
      }),
    );
  });

  it("allows customer service read-only monitoring", async () => {
    const granted = workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF");
    const actor = {
      sessionUserId: "cs-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "CUSTOMER_SERVICE" as const,
      email: "cs@example.com",
      granted,
    };
    requireWorkspacePermissionActor.mockResolvedValue(actor);

    const access = await requireIntegrationsReadActor();

    expect(access.ok).toBe(true);
    if (access.ok) {
      expect(access.canManage).toBe(false);
    }
    expect(logIntegrationPermissionDenied).not.toHaveBeenCalled();
  });
});
