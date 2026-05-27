import { describe, expect, it } from "vitest";

import { workspacePermissionForExport } from "@/lib/import-export/export-permission";
import { hasPermission } from "@/lib/permissions/guards";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

describe("workspacePermissionForExport", () => {
  it("maps operational exports to canonical export keys", () => {
    expect(workspacePermissionForExport("orders")).toBe("orders.export");
    expect(workspacePermissionForExport("customers")).toBe("customers.export");
    expect(workspacePermissionForExport("packing")).toBe("orders.export");
    expect(workspacePermissionForExport("production")).toBe("reports.export");
    expect(workspacePermissionForExport("integrations_metadata")).toBe("integrations.manage");
    expect(workspacePermissionForExport("audit_logs")).toBe("audit.export");
  });
});

describe("export permissions by staff template", () => {
  it("denies line-cook staff order CSV export", () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    expect(hasPermission(granted, workspacePermissionForExport("orders"))).toBe(false);
    expect(hasPermission(granted, workspacePermissionForExport("production"))).toBe(false);
  });

  it("allows manager staff sensitive exports", () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    expect(hasPermission(granted, workspacePermissionForExport("orders"))).toBe(true);
    expect(hasPermission(granted, workspacePermissionForExport("customers"))).toBe(true);
    expect(hasPermission(granted, workspacePermissionForExport("production"))).toBe(true);
  });

  it("allows accounting staff report exports without integrations metadata", () => {
    const granted = workspacePermissionsFromStaffTemplate("ACCOUNTING", "STAFF");
    expect(hasPermission(granted, workspacePermissionForExport("production"))).toBe(true);
    expect(hasPermission(granted, workspacePermissionForExport("integrations_metadata"))).toBe(false);
  });
});
