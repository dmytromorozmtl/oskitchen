import { describe, expect, it } from "vitest";

import { hasLegacyPermission, normalizeRole } from "@/lib/permissions/legacy";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import { hasPermission } from "@/lib/permissions/guards";

describe("CRM RBAC", () => {
  it("OWNER workspace role has customers.read and customers.manage", () => {
    const granted = defaultPermissionsForWorkspaceRole("OWNER");
    expect(hasPermission(granted, "customers.read")).toBe(true);
    expect(hasPermission(granted, "customers.manage")).toBe(true);
  });

  it("STAFF workspace role lacks customers.manage (legacy manager fallback only)", () => {
    const granted = defaultPermissionsForWorkspaceRole("STAFF");
    expect(hasPermission(granted, "customers.manage")).toBe(false);
  });

  it("legacy MANAGER can manage customers", () => {
    expect(hasLegacyPermission(normalizeRole("MANAGER"), "manage_customers")).toBe(true);
  });

  it("legacy KITCHEN_STAFF cannot manage customers", () => {
    expect(hasLegacyPermission(normalizeRole("KITCHEN_STAFF"), "manage_customers")).toBe(false);
  });
});
