import { describe, expect, it } from "vitest";

import { canDoCrm, isSuperAdmin } from "@/lib/crm/customer-permissions";
import { resolveCrmActorScope } from "@/lib/crm/resolve-crm-actor-scope";

describe("crm platform bypass", () => {
  it("denies crm superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(isSuperAdmin(scope)).toBe(false);
    expect(canDoCrm(scope, "crm.merge")).toBe(false);
    expect(canDoCrm(scope, "crm.export")).toBe(false);
  });

  it("allows crm superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(isSuperAdmin(scope)).toBe(true);
    expect(canDoCrm(scope, "crm.merge")).toBe(true);
    expect(canDoCrm(scope, "crm.read.full_profile")).toBe(true);
  });

  it("passes platformBypass from workspace actor into crm scope", () => {
    const scope = resolveCrmActorScope({
      workspaceRole: "STAFF",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      profileEmail: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canDoCrm(scope, "crm.archive")).toBe(true);
  });

  it("preserves owner crm access without platformBypass", () => {
    const scope = resolveCrmActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
      profileRole: "OWNER",
      profileEmail: "owner@example.com",
    });

    expect(canDoCrm(scope, "crm.merge")).toBe(true);
    expect(canDoCrm(scope, "crm.consent.edit")).toBe(true);
  });

  it("preserves role-scoped crm access without platformBypass", () => {
    const scope = resolveCrmActorScope({
      workspaceRole: "STAFF",
      email: "sales@example.com",
      profileRole: "sales",
      profileEmail: "sales@example.com",
    });

    expect(canDoCrm(scope, "crm.export")).toBe(true);
    expect(canDoCrm(scope, "crm.merge")).toBe(false);
  });
});
