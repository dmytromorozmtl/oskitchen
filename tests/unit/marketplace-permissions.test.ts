import { describe, expect, it } from "vitest";

import { hasPermission } from "@/lib/permissions/guards";
import {
  defaultPermissionsForWorkspaceRole,
  MARKETPLACE_ADMIN_PERMISSIONS,
  MARKETPLACE_BUYER_PERMISSIONS,
  MARKETPLACE_PERMISSIONS,
  MARKETPLACE_VENDOR_PERMISSIONS,
  PERMISSIONS,
} from "@/lib/permissions/permissions";

describe("marketplace RBAC permissions", () => {
  it("registers buyer, vendor, and admin permission keys", () => {
    expect(MARKETPLACE_BUYER_PERMISSIONS).toHaveLength(8);
    expect(MARKETPLACE_VENDOR_PERMISSIONS).toHaveLength(8);
    expect(MARKETPLACE_ADMIN_PERMISSIONS).toHaveLength(4);
    expect(MARKETPLACE_PERMISSIONS).toHaveLength(20);

    for (const key of MARKETPLACE_PERMISSIONS) {
      expect(PERMISSIONS[key]).toBeTypeOf("string");
    }
  });

  it("grants buyer marketplace permissions to workspace owners", () => {
    const granted = defaultPermissionsForWorkspaceRole("OWNER");

    for (const permission of MARKETPLACE_BUYER_PERMISSIONS) {
      expect(hasPermission(granted, permission)).toBe(true);
    }

    for (const permission of MARKETPLACE_VENDOR_PERMISSIONS) {
      expect(hasPermission(granted, permission)).toBe(false);
    }

    for (const permission of MARKETPLACE_ADMIN_PERMISSIONS) {
      expect(hasPermission(granted, permission)).toBe(false);
    }
  });

  it("grants read-only marketplace access to default staff", () => {
    const granted = defaultPermissionsForWorkspaceRole("STAFF");

    expect(hasPermission(granted, "marketplace:read")).toBe(true);
    expect(hasPermission(granted, "marketplace:orders:read")).toBe(true);
    expect(hasPermission(granted, "marketplace:cart:write")).toBe(false);
    expect(hasPermission(granted, "marketplace:orders:create")).toBe(false);
    expect(hasPermission(granted, "vendor:cabinet:access")).toBe(false);
    expect(hasPermission(granted, "marketplace:admin:moderate")).toBe(false);
  });
});
