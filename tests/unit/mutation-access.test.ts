import { describe, expect, it } from "vitest";

import { hasLegacyPermission, normalizeRole } from "@/lib/permissions/legacy";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import { hasPermission } from "@/lib/permissions/guards";

describe("mutation access bridge", () => {
  it("OWNER workspace role has production.manage", () => {
    const granted = defaultPermissionsForWorkspaceRole("OWNER");
    expect(hasPermission(granted, "production.manage")).toBe(true);
  });

  it("legacy KITCHEN_STAFF has manage_production fallback", () => {
    expect(hasLegacyPermission(normalizeRole("KITCHEN_STAFF"), "manage_production")).toBe(true);
    expect(hasLegacyPermission(normalizeRole("KITCHEN_STAFF"), "manage_integrations")).toBe(false);
  });

  it("OWNER workspace role has kitchen view and bump permissions", () => {
    const granted = defaultPermissionsForWorkspaceRole("OWNER");
    expect(hasPermission(granted, "kitchen.view")).toBe(true);
    expect(hasPermission(granted, "kitchen.bump")).toBe(true);
  });
});
