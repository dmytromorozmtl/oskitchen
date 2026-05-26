import { describe, expect, it } from "vitest";

import { buildPosSubnavLinks } from "@/lib/pos/pos-subnav-links";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

describe("POS subnav links", () => {
  it("shows manager-only POS admin links for manager templates", () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    const links = buildPosSubnavLinks(granted).map((link) => link.href);

    expect(links).toContain("/dashboard/pos/registers");
    expect(links).toContain("/dashboard/pos/shifts");
    expect(links).toContain("/dashboard/pos/settings");
  });

  it("keeps customer-service staff on core POS links only", () => {
    const granted = workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF");
    const links = buildPosSubnavLinks(granted).map((link) => link.href);

    expect(links).toContain("/dashboard/pos");
    expect(links).toContain("/dashboard/pos/terminal");
    expect(links).toContain("/dashboard/pos/transactions");
    expect(links).not.toContain("/dashboard/pos/registers");
    expect(links).not.toContain("/dashboard/pos/shifts");
    expect(links).not.toContain("/dashboard/pos/settings");
  });

  it("returns no POS links without POS access", () => {
    const granted = workspacePermissionsFromStaffTemplate("VIEWER", "STAFF");
    expect(buildPosSubnavLinks(granted)).toEqual([]);
  });
});
