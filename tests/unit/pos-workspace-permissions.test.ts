import { describe, expect, it } from "vitest";

import { hasPermission } from "@/lib/permissions/guards";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

describe("POS workspace permissions", () => {
  it("coarse STAFF fallback can access checkout but not manager-only POS controls", () => {
    const granted = defaultPermissionsForWorkspaceRole("STAFF");
    expect(hasPermission(granted, "pos.access")).toBe(true);
    expect(hasPermission(granted, "pos.checkout")).toBe(true);
    expect(hasPermission(granted, "pos.refund")).toBe(false);
    expect(hasPermission(granted, "pos.register.manage")).toBe(false);
  });

  it("MANAGER staff template receives the canonical manager POS bundle", () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    expect(hasPermission(granted, "pos.access")).toBe(true);
    expect(hasPermission(granted, "pos.checkout")).toBe(true);
    expect(hasPermission(granted, "pos.discount.apply")).toBe(true);
    expect(hasPermission(granted, "pos.refund")).toBe(true);
    expect(hasPermission(granted, "pos.void")).toBe(true);
    expect(hasPermission(granted, "pos.shift.open")).toBe(true);
    expect(hasPermission(granted, "pos.shift.close")).toBe(true);
    expect(hasPermission(granted, "pos.register.manage")).toBe(true);
  });

  it("customer-facing staff can checkout but cannot refund or void", () => {
    const granted = workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF");
    expect(hasPermission(granted, "pos.access")).toBe(true);
    expect(hasPermission(granted, "pos.checkout")).toBe(true);
    expect(hasPermission(granted, "pos.refund")).toBe(false);
    expect(hasPermission(granted, "pos.void")).toBe(false);
  });

  it("viewers cannot access POS checkout", () => {
    const granted = workspacePermissionsFromStaffTemplate("VIEWER", "STAFF");
    expect(hasPermission(granted, "pos.access")).toBe(false);
    expect(hasPermission(granted, "pos.checkout")).toBe(false);
  });
});
