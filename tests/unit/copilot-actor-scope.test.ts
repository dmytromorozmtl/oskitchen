import { describe, expect, it } from "vitest";

import { createCopilotActorScope } from "@/lib/ai/copilot-actor-scope";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";

describe("createCopilotActorScope", () => {
  it("keeps owner sessions owner-scoped", () => {
    const scope = createCopilotActorScope({
      sessionUserId: "owner-user",
      userId: "owner-user",
      workspaceRole: "OWNER",
      staffRoleType: "OWNER",
      email: "owner@example.com",
    });

    expect(scope.isOwner).toBe(true);
    expect(scope.role).toBeNull();
    expect(canUseCopilot(scope, "copilot.settings.manage")).toBe(true);
    expect(canUseCopilot(scope, "copilot.actions.approve")).toBe(true);
  });

  it("maps manager staff sessions without escalating them to owner", () => {
    const scope = createCopilotActorScope({
      sessionUserId: "staff-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: "MANAGER",
      email: "manager@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBe("manager");
    expect(canUseCopilot(scope, "copilot.view")).toBe(true);
    expect(canUseCopilot(scope, "copilot.actions.approve")).toBe(true);
  });

  it("maps kitchen operators to non-owner operational access only", () => {
    const scope = createCopilotActorScope({
      sessionUserId: "prep-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: "PREP_COOK",
      email: "prep@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBe("kitchen");
    expect(canUseCopilot(scope, "copilot.view")).toBe(true);
    expect(canUseCopilot(scope, "copilot.chat")).toBe(false);
    expect(canUseCopilot(scope, "copilot.settings.manage")).toBe(false);
  });

  it("maps accounting staff to financial read access without customer-pii elevation", () => {
    const scope = createCopilotActorScope({
      sessionUserId: "finance-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: "ACCOUNTING",
      email: "finance@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBe("accountant");
    expect(canUseCopilot(scope, "copilot.view")).toBe(true);
    expect(canUseCopilot(scope, "copilot.read.financial")).toBe(true);
    expect(canUseCopilot(scope, "copilot.read.customer_pii")).toBe(false);
  });

  it("does not grant copilot access to untyped staff sessions", () => {
    const scope = createCopilotActorScope({
      sessionUserId: "staff-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: null,
      email: "staff@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBeNull();
    expect(canUseCopilot(scope, "copilot.view")).toBe(false);
  });
});
