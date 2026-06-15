import { describe, expect, it } from "vitest";

import { resolveStaffActorScope } from "@/lib/staff/resolve-staff-actor-scope";
import { canManageStaff } from "@/lib/staff/staff-permissions";

describe("resolveStaffActorScope", () => {
  it("does not treat every user as owner", () => {
    const scope = resolveStaffActorScope({
      workspaceRole: "STAFF",
      email: "mgr@example.com",
      profileRole: "manager",
      profileEmail: "mgr@example.com",
    });
    expect(scope.isOwner).toBe(false);
    expect(canManageStaff(scope, "staff.create")).toBe(true);
    expect(canManageStaff(scope, "staff.role.create")).toBe(false);
  });

  it("grants owner capabilities for workspace OWNER role", () => {
    const scope = resolveStaffActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
      profileRole: "OWNER",
      profileEmail: "owner@example.com",
    });
    expect(scope.isOwner).toBe(true);
    expect(canManageStaff(scope, "staff.role.create")).toBe(true);
  });
});
