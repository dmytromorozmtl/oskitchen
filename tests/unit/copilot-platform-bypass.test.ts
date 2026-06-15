import { describe, expect, it } from "vitest";

import { createCopilotActorScope } from "@/lib/ai/copilot-actor-scope";
import {
  canUseCopilot,
  isSuperAdminCopilot,
} from "@/lib/ai/copilot-permissions";

describe("copilot platform bypass", () => {
  it("denies copilot superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(isSuperAdminCopilot(scope)).toBe(false);
    expect(canUseCopilot(scope, "copilot.settings.manage")).toBe(false);
    expect(canUseCopilot(scope, "copilot.actions.approve")).toBe(false);
  });

  it("allows copilot superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(isSuperAdminCopilot(scope)).toBe(true);
    expect(canUseCopilot(scope, "copilot.settings.manage")).toBe(true);
    expect(canUseCopilot(scope, "copilot.read.customer_pii")).toBe(true);
  });

  it("passes platformBypass from workspace actor into copilot scope", () => {
    const scope = createCopilotActorScope({
      sessionUserId: "user-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF",
      staffRoleType: "PACKER",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canUseCopilot(scope, "copilot.actions.approve")).toBe(true);
  });

  it("preserves owner copilot access without platformBypass", () => {
    const scope = createCopilotActorScope({
      sessionUserId: "owner-user",
      userId: "owner-user",
      workspaceRole: "OWNER",
      staffRoleType: "OWNER",
      email: "owner@example.com",
    });

    expect(canUseCopilot(scope, "copilot.settings.manage")).toBe(true);
  });
});
