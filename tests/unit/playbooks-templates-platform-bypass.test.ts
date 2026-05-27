import { describe, expect, it } from "vitest";

import { createPlaybookActorScope } from "@/lib/playbooks/playbook-actor-scope";
import {
  canUsePlaybooks,
  isSuperAdminPlaybooks,
} from "@/lib/playbooks/playbook-permissions";
import { createTemplateActorScope } from "@/lib/templates/template-actor-scope";
import {
  canUseTemplates,
  isSuperAdminTemplates,
} from "@/lib/templates/template-permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const packerGranted = workspacePermissionsFromStaffTemplate("PACKER", "STAFF");

describe("playbooks and templates platform bypass", () => {
  it("denies playbooks when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      granted: packerGranted,
      platformBypass: false,
    };

    expect(isSuperAdminPlaybooks(scope)).toBe(false);
    expect(canUsePlaybooks(scope, "playbooks.edit")).toBe(false);
  });

  it("allows playbooks when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      granted: packerGranted,
      platformBypass: true,
    };

    expect(canUsePlaybooks(scope, "playbooks.edit")).toBe(true);
  });

  it("passes platformBypass from workspace actor into playbook scope", () => {
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

    const scope = createPlaybookActorScope(actor, "STAFF");
    expect(scope.platformBypass).toBe(true);
    expect(canUsePlaybooks(scope, "playbooks.run")).toBe(true);
  });

  it("denies templates when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      granted: packerGranted,
      platformBypass: false,
    };

    expect(isSuperAdminTemplates(scope)).toBe(false);
    expect(canUseTemplates(scope, "templates.apply")).toBe(false);
  });

  it("allows templates when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      granted: packerGranted,
      platformBypass: true,
    };

    expect(canUseTemplates(scope, "templates.apply")).toBe(true);
  });

  it("passes platformBypass from workspace actor into template scope", () => {
    const actor = {
      sessionUserId: "user-1",
      userId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "PACKER" as const,
      email: "ops@example.com",
      granted: packerGranted,
      platformBypass: true,
    };

    const scope = createTemplateActorScope(actor, "STAFF");
    expect(scope.platformBypass).toBe(true);
    expect(canUseTemplates(scope, "templates.preview")).toBe(true);
  });
});
