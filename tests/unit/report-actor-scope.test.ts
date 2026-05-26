import { describe, expect, it } from "vitest";

import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { canDoReports } from "@/lib/reports/report-permissions";

describe("createReportActorScope", () => {
  it("keeps owner sessions owner-scoped", () => {
    const scope = createReportActorScope({
      sessionUserId: "owner-user",
      userId: "owner-user",
      workspaceRole: "OWNER",
      staffRoleType: "OWNER",
      email: "owner@example.com",
    });

    expect(scope.isOwner).toBe(true);
    expect(scope.role).toBeNull();
    expect(canDoReports(scope, "reports.read.financial")).toBe(true);
    expect(canDoReports(scope, "reports.export")).toBe(true);
  });

  it("maps manager staff to report manager access without owner escalation", () => {
    const scope = createReportActorScope({
      sessionUserId: "manager-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: "MANAGER",
      email: "manager@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBe("manager");
    expect(canDoReports(scope, "reports.read.financial")).toBe(true);
    expect(canDoReports(scope, "reports.saved.manage")).toBe(true);
  });

  it("maps kitchen operators to operational reports only", () => {
    const scope = createReportActorScope({
      sessionUserId: "prep-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: "PREP_COOK",
      email: "prep@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBe("kitchen");
    expect(canDoReports(scope, "reports.read.operations")).toBe(true);
    expect(canDoReports(scope, "reports.read.financial")).toBe(false);
    expect(canDoReports(scope, "reports.export")).toBe(false);
  });

  it("maps accounting staff to financial and export access", () => {
    const scope = createReportActorScope({
      sessionUserId: "finance-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: "ACCOUNTING",
      email: "finance@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBe("accountant");
    expect(canDoReports(scope, "reports.read.financial")).toBe(true);
    expect(canDoReports(scope, "reports.export")).toBe(true);
    expect(canDoReports(scope, "reports.read.customer_pii")).toBe(false);
  });

  it("does not grant report permissions to untyped staff sessions", () => {
    const scope = createReportActorScope({
      sessionUserId: "staff-user",
      userId: "owner-user",
      workspaceRole: "STAFF",
      staffRoleType: null,
      email: "staff@example.com",
    });

    expect(scope.isOwner).toBe(false);
    expect(scope.role).toBeNull();
    expect(canDoReports(scope, "reports.read.operations")).toBe(false);
    expect(canDoReports(scope, "reports.export")).toBe(false);
  });
});
