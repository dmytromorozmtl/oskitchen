import { describe, expect, it } from "vitest";

import { canUseImportCenter } from "@/lib/import-center/import-permissions";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";

describe("import center legacy scope bridge", () => {
  it("owner scope has full import access", () => {
    const scope = { isOwner: true, role: "OWNER", email: "o@test.com" };
    const ownerGranted = defaultPermissionsForWorkspaceRole("OWNER");
    expect(canUseImportCenter(scope, "import.commit", ownerGranted)).toBe(true);
    expect(canUseImportCenter(scope, "import.rollback", ownerGranted)).toBe(true);
  });

  it("manager with products.edit can upload but not commit", () => {
    const scope = { isOwner: false, role: "MANAGER", email: "m@test.com" };
    const managerGranted = new Set([
      "workspace.view",
      "products.edit",
    ] as const);
    expect(canUseImportCenter(scope, "import.upload", managerGranted)).toBe(true);
    expect(canUseImportCenter(scope, "import.commit", managerGranted)).toBe(false);
  });
});
