import { describe, expect, it } from "vitest";

import { createExecutiveActorScope } from "@/lib/executive/executive-actor-scope";
import {
  canViewExecutive,
  isSuperAdminExecutive,
} from "@/lib/executive/executive-permissions";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import {
  canDoReports,
  isSuperAdminReports,
} from "@/lib/reports/report-permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const packerGranted = workspacePermissionsFromStaffTemplate("PACKER", "STAFF");

describe("reports and executive platform bypass", () => {
  it("denies reports when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      granted: packerGranted,
      platformBypass: false,
    };

    expect(isSuperAdminReports(scope)).toBe(false);
    expect(canDoReports(scope, "reports.read.financial")).toBe(false);
  });

  it("allows reports when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      granted: packerGranted,
      platformBypass: true,
    };

    expect(isSuperAdminReports(scope)).toBe(true);
    expect(canDoReports(scope, "reports.read.financial")).toBe(true);
    expect(canDoReports(scope, "reports.export")).toBe(true);
  });

  it("passes platformBypass from workspace actor into report scope", () => {
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

    const scope = createReportActorScope(actor);
    expect(scope.platformBypass).toBe(true);
    expect(canDoReports(scope, "reports.read.financial")).toBe(true);
  });

  it("denies executive when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      granted: packerGranted,
      platformBypass: false,
    };

    expect(isSuperAdminExecutive(scope)).toBe(false);
    expect(canViewExecutive(scope, "executive.read.financial")).toBe(false);
  });

  it("allows executive when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      granted: packerGranted,
      platformBypass: true,
    };

    expect(isSuperAdminExecutive(scope)).toBe(true);
    expect(canViewExecutive(scope, "executive.read.financial")).toBe(true);
    expect(canViewExecutive(scope, "executive.read.customer_pii")).toBe(true);
  });

  it("passes platformBypass from workspace actor into executive scope", () => {
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

    const scope = createExecutiveActorScope(actor);
    expect(scope.platformBypass).toBe(true);
    expect(canViewExecutive(scope, "executive.read.financial")).toBe(true);
  });
});
