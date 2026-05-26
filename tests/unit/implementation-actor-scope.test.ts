import { describe, expect, it } from "vitest";

import { createImplementationActorScope } from "@/lib/implementation/implementation-actor-scope";
import { canUseImplementation } from "@/lib/implementation/implementation-permissions";

describe("createImplementationActorScope", () => {
  it("keeps owner sessions owner-scoped", () => {
    const scope = createImplementationActorScope({
      sessionUserId: "owner-user",
      userId: "owner-user",
      workspaceRole: "OWNER",
      staffRoleType: "OWNER",
      email: "owner@example.com",
    });

    expect(scope.isOwner).toBe(true);
    expect(scope.role).toBeNull();
    expect(canUseImplementation(scope, "implementation.create")).toBe(true);
    expect(canUseImplementation(scope, "implementation.go_live")).toBe(true);
  });

  it("maps manager staff sessions without escalating them to owner", () => {
    const scope = createImplementationActorScope({
      sessionUserId: "manager-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: "MANAGER",
      email: "manager@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBe("manager");
    expect(canUseImplementation(scope, "implementation.view")).toBe(true);
    expect(canUseImplementation(scope, "implementation.create")).toBe(true);
    expect(canUseImplementation(scope, "implementation.go_live")).toBe(false);
  });

  it("maps kitchen staff to checklist access without edit escalation", () => {
    const scope = createImplementationActorScope({
      sessionUserId: "prep-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: "PREP_COOK",
      email: "prep@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBe("kitchen");
    expect(canUseImplementation(scope, "implementation.view")).toBe(true);
    expect(canUseImplementation(scope, "implementation.complete_checklist")).toBe(true);
    expect(canUseImplementation(scope, "implementation.edit")).toBe(false);
  });

  it("maps accounting staff to reporting access only", () => {
    const scope = createImplementationActorScope({
      sessionUserId: "finance-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: "ACCOUNTING",
      email: "finance@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBe("accountant");
    expect(canUseImplementation(scope, "implementation.reports")).toBe(true);
    expect(canUseImplementation(scope, "implementation.create")).toBe(false);
  });

  it("does not grant implementation permissions to untyped staff sessions", () => {
    const scope = createImplementationActorScope({
      sessionUserId: "staff-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: null,
      email: "staff@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBeNull();
    expect(canUseImplementation(scope, "implementation.view")).toBe(false);
    expect(canUseImplementation(scope, "implementation.create")).toBe(false);
  });
});
