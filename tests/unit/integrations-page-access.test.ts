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

import { requireIntegrationsManagePage } from "@/lib/integrations/integrations-page-access";

describe("integrations page access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies staff without integrations.manage", async () => {
    requireWorkspacePermissionActor.mockResolvedValue({
      granted: workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF"),
    });

    const access = await requireIntegrationsManagePage();

    expect(access.ok).toBe(false);
    if (!access.ok) {
      expect(access.deny).toBeTruthy();
    }
  });

  it.each([
    {
      label: "manager",
      granted: workspacePermissionsFromStaffTemplate("MANAGER", "STAFF"),
    },
    {
      label: "owner",
      granted: defaultPermissionsForWorkspaceRole("OWNER"),
    },
  ])("allows $label actors with integrations.manage", async ({ granted }) => {
    requireWorkspacePermissionActor.mockResolvedValue({ granted });

    const access = await requireIntegrationsManagePage();

    expect(access.ok).toBe(true);
  });
});
