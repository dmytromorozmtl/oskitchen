import { describe, expect, it } from "vitest";

import { workspacePermissionForExport } from "@/lib/import-export/export-permission";

describe("workspacePermissionForExport", () => {
  it("maps operational exports", () => {
    expect(workspacePermissionForExport("orders")).toBe("orders.manage");
    expect(workspacePermissionForExport("production")).toBe("production.manage");
    expect(workspacePermissionForExport("integrations_metadata")).toBe("integrations.manage");
  });
});
