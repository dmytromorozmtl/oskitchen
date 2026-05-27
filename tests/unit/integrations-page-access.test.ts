import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

vi.mock("@/components/dashboard/pos-access-card", () => ({
  PosAccessCard: ({ description }: { description: string }) =>
    createElement("div", { "data-testid": "integrations-deny" }, description),
}));

import {
  canManageIntegrations,
  canReadIntegrations,
  requireIntegrationsManagePage,
  requireIntegrationsReadPage,
} from "@/lib/integrations/integrations-page-access";

describe("integrations page access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies staff without integrations.read or manage", async () => {
    requireWorkspacePermissionActor.mockResolvedValue({
      granted: workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF"),
    });

    const access = await requireIntegrationsReadPage();

    expect(access.ok).toBe(false);
    if (!access.ok) {
      expect(access.deny).toBeTruthy();
    }
  });

  it("allows customer service read-only channel monitoring", async () => {
    const granted = workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF");
    requireWorkspacePermissionActor.mockResolvedValue({ granted });

    const access = await requireIntegrationsReadPage();

    expect(access.ok).toBe(true);
    if (access.ok) {
      expect(canReadIntegrations(granted)).toBe(true);
      expect(canManageIntegrations(granted)).toBe(false);
      expect(access.canManage).toBe(false);
    }
  });

  it.each([
    {
      label: "manager",
      granted: workspacePermissionsFromStaffTemplate("MANAGER", "STAFF"),
      canManage: true,
    },
    {
      label: "owner",
      granted: defaultPermissionsForWorkspaceRole("OWNER"),
      canManage: true,
    },
  ])("allows $label actors with integrations.manage", async ({ granted, canManage }) => {
    requireWorkspacePermissionActor.mockResolvedValue({ granted });

    const readAccess = await requireIntegrationsReadPage();
    const manageAccess = await requireIntegrationsManagePage();

    expect(readAccess.ok).toBe(true);
    expect(manageAccess.ok).toBe(true);
    if (readAccess.ok) {
      expect(readAccess.canManage).toBe(canManage);
    }
  });

  it("denies manage page for read-only staff", async () => {
    requireWorkspacePermissionActor.mockResolvedValue({
      granted: workspacePermissionsFromStaffTemplate("VIEWER", "STAFF"),
    });

    const access = await requireIntegrationsManagePage();

    expect(access.ok).toBe(false);
  });
});
