import { describe, expect, it } from "vitest";

import { createGrowthActorScope } from "@/lib/growth/growth-actor-scope";
import { canUseGrowth } from "@/lib/growth/growth-permissions";
import { canUseImportCenter } from "@/lib/import-center/import-permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const packerGranted = workspacePermissionsFromStaffTemplate("PACKER", "STAFF");

describe("growth and import center platform bypass", () => {
  it("denies growth when bootstrap email lacks platformBypass", () => {
    const scope = {
      userId: "user-1",
      email: "workspace.moroz@gmail.com",
      isOwner: false,
      role: "STAFF",
      granted: packerGranted,
      platformBypass: false,
    };

    expect(canUseGrowth(scope, "growth.manage")).toBe(false);
    expect(canUseGrowth(scope, "growth.view")).toBe(false);
  });

  it("allows growth when platformBypass is true without canonical growth keys", () => {
    const scope = {
      userId: "user-1",
      email: "ops@example.com",
      isOwner: false,
      role: "STAFF",
      granted: packerGranted,
      platformBypass: true,
    };

    expect(canUseGrowth(scope, "growth.manage")).toBe(true);
  });

  it("passes platformBypass from workspace actor into growth scope", () => {
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

    const scope = createGrowthActorScope(actor, "STAFF");
    expect(scope.platformBypass).toBe(true);
    expect(canUseGrowth(scope, "growth.view")).toBe(true);
  });

  it("denies legacy import center access when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "STAFF",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(canUseImportCenter(scope, "import.upload")).toBe(false);
    expect(canUseImportCenter(scope, "import.commit")).toBe(false);
  });

  it("allows legacy import center access when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "STAFF",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(canUseImportCenter(scope, "import.upload")).toBe(true);
  });
});
