import { describe, expect, it } from "vitest";

import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

describe("workspacePermissionsFromStaffTemplate (Phase D)", () => {
  it("OWNER profile gets full matrix", () => {
    const perms = workspacePermissionsFromStaffTemplate("VIEWER", "OWNER");
    expect(perms.has("billing.manage")).toBe(true);
    expect(perms.has("workspace.settings")).toBe(true);
  });

  it("PACKER template is narrower than MANAGER", () => {
    const packer = workspacePermissionsFromStaffTemplate("PACKER", "STAFF");
    const manager = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    expect(packer.has("orders.manage")).toBe(false);
    expect(packer.has("packing.manage")).toBe(true);
    expect(manager.has("staff.manage")).toBe(true);
  });

  it("VIEWER has read-only scope", () => {
    const viewer = workspacePermissionsFromStaffTemplate("VIEWER", "STAFF");
    expect(viewer.has("workspace.view")).toBe(true);
    expect(viewer.has("orders.manage")).toBe(false);
  });
});
