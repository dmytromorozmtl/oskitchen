import { describe, expect, it } from "vitest";

import { createImplementationActorScope } from "@/lib/implementation/implementation-actor-scope";
import {
  canUseImplementation,
  isSuperAdminImplementation,
} from "@/lib/implementation/implementation-permissions";

describe("implementation platform bypass", () => {
  it("denies implementation superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(isSuperAdminImplementation(scope)).toBe(false);
    expect(canUseImplementation(scope, "implementation.create")).toBe(false);
    expect(canUseImplementation(scope, "implementation.go_live")).toBe(false);
  });

  it("allows implementation superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(isSuperAdminImplementation(scope)).toBe(true);
    expect(canUseImplementation(scope, "implementation.go_live")).toBe(true);
    expect(canUseImplementation(scope, "implementation.edit")).toBe(true);
  });

  it("passes platformBypass from workspace actor into implementation scope", () => {
    const scope = createImplementationActorScope({
      sessionUserId: "user-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF",
      staffRoleType: "PACKER",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canUseImplementation(scope, "implementation.run_readiness")).toBe(true);
  });

  it("preserves owner implementation access without platformBypass", () => {
    const scope = createImplementationActorScope({
      sessionUserId: "owner-user",
      userId: "owner-user",
      workspaceRole: "OWNER",
      staffRoleType: "OWNER",
      email: "owner@example.com",
    });

    expect(canUseImplementation(scope, "implementation.go_live")).toBe(true);
  });
});
