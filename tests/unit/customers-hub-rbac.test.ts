import { describe, expect, it } from "vitest";

import { canManageCustomers, canViewCustomers } from "@/lib/crm/customers-permission";
import { buildCustomersSubnavLinks } from "@/lib/crm/customers-subnav-links";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

describe("customers hub RBAC", () => {
  it("OWNER has read and manage", () => {
    const granted = defaultPermissionsForWorkspaceRole("OWNER");
    expect(canViewCustomers(granted)).toBe(true);
    expect(canManageCustomers(granted)).toBe(true);
  });

  it("customer-service staff can view but not manage customers", () => {
    const granted = workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF");
    expect(canViewCustomers(granted)).toBe(true);
    expect(canManageCustomers(granted)).toBe(false);
    const hrefs = buildCustomersSubnavLinks({
      canView: true,
      canManage: false,
    }).map((link) => link.href);
    expect(hrefs).toContain("/dashboard/customers/list");
    expect(hrefs).not.toContain("/dashboard/customers/dedupe");
  });

  it("marketing staff can view and manage customers", () => {
    const granted = workspacePermissionsFromStaffTemplate("MARKETING", "STAFF");
    expect(canViewCustomers(granted)).toBe(true);
    expect(canManageCustomers(granted)).toBe(true);
    expect(
      buildCustomersSubnavLinks({ canView: true, canManage: true }).some(
        (link) => link.href === "/dashboard/customers/dedupe",
      ),
    ).toBe(true);
  });

  it("kitchen staff without CRM access see no subnav links", () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    expect(canViewCustomers(granted)).toBe(false);
    expect(buildCustomersSubnavLinks({ canView: false, canManage: false })).toEqual([]);
  });
});
