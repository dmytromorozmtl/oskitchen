import { describe, expect, it } from "vitest";

import { resolveStaffActorScope } from "@/lib/staff/resolve-staff-actor-scope";
import {
  canManageStaff,
  isSuperAdminStaff,
} from "@/lib/staff/staff-permissions";
import { resolveTrainingActorScope } from "@/lib/training/resolve-training-actor-scope";
import {
  canUseTraining,
  isSuperAdminTraining,
} from "@/lib/training/training-permissions";

describe("staff and training platform bypass", () => {
  it("denies staff superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(isSuperAdminStaff(scope)).toBe(false);
    expect(canManageStaff(scope, "staff.create")).toBe(false);
  });

  it("allows staff superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(isSuperAdminStaff(scope)).toBe(true);
    expect(canManageStaff(scope, "staff.role.create")).toBe(true);
  });

  it("passes platformBypass from workspace actor into staff scope", () => {
    const scope = resolveStaffActorScope({
      workspaceRole: "STAFF",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      profileEmail: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canManageStaff(scope, "staff.archive")).toBe(true);
  });

  it("denies training superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(isSuperAdminTraining(scope)).toBe(false);
    expect(canUseTraining(scope, "training.program.create")).toBe(false);
  });

  it("allows training superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(isSuperAdminTraining(scope)).toBe(true);
    expect(canUseTraining(scope, "training.sop.publish")).toBe(true);
  });

  it("passes platformBypass from workspace actor into training scope", () => {
    const scope = resolveTrainingActorScope({
      workspaceRole: "STAFF",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      profileEmail: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canUseTraining(scope, "training.cert.revoke")).toBe(true);
  });

  it("preserves owner staff and training access without platformBypass", () => {
    const staffScope = resolveStaffActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
      profileRole: "OWNER",
      profileEmail: "owner@example.com",
    });
    const trainingScope = resolveTrainingActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
      profileRole: "OWNER",
      profileEmail: "owner@example.com",
    });

    expect(canManageStaff(staffScope, "staff.role.create")).toBe(true);
    expect(canUseTraining(trainingScope, "training.cert.revoke")).toBe(true);
  });
});
