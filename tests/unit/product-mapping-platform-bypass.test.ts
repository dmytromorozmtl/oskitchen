import { describe, expect, it } from "vitest";

import { createProductMappingActorScope } from "@/lib/product-mapping/mapping-actor-scope";
import {
  canUseProductMapping,
  isSuperAdminMapping,
} from "@/lib/product-mapping/mapping-permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const packerGranted = workspacePermissionsFromStaffTemplate("PACKER", "STAFF");

describe("product-mapping platform bypass", () => {
  it("denies mapping superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      granted: packerGranted,
      platformBypass: false,
    };

    expect(isSuperAdminMapping(scope)).toBe(false);
    expect(canUseProductMapping(scope, "mapping.approve")).toBe(false);
  });

  it("allows mapping superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      granted: packerGranted,
      platformBypass: true,
    };

    expect(isSuperAdminMapping(scope)).toBe(true);
    expect(canUseProductMapping(scope, "mapping.approve")).toBe(true);
    expect(canUseProductMapping(scope, "mapping.bulk")).toBe(true);
  });

  it("passes platformBypass from workspace actor into mapping scope", () => {
    const actor = {
      sessionUserId: "user-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "PACKER" as const,
      email: "workspace.moroz@gmail.com",
      granted: packerGranted,
      platformBypass: true,
    };

    const scope = createProductMappingActorScope(actor, "staff");
    expect(scope.platformBypass).toBe(true);
    expect(canUseProductMapping(scope, "mapping.import")).toBe(true);
  });

  it("preserves owner mapping access without platformBypass", () => {
    const actor = {
      sessionUserId: "owner-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "OWNER" as const,
      staffRoleType: null,
      email: "owner@example.com",
      granted: workspacePermissionsFromStaffTemplate("OWNER", "OWNER"),
      platformBypass: false,
    };

    const scope = createProductMappingActorScope(actor, "OWNER");
    expect(canUseProductMapping(scope, "mapping.archive")).toBe(true);
  });
});
