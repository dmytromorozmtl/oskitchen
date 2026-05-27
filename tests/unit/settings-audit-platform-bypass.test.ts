import { describe, expect, it } from "vitest";

import {
  canExportAuditLogs,
  canManageRetentionPolicy,
  canViewAuditLogs,
  canViewSensitiveAuditDetail,
} from "@/lib/audit/audit-permissions";
import { canAccessSettingsSection } from "@/lib/settings/settings-access";
import {
  canUseSettings,
  isSuperAdminSettings,
} from "@/lib/settings/settings-permissions";

describe("settings and audit platform bypass", () => {
  it("denies settings superadmin bridge when bootstrap email lacks platformBypass", () => {
    const actor = {
      userId: "user-1",
      email: "workspace.moroz@gmail.com",
      role: "STAFF",
      platformBypass: false,
    };

    expect(isSuperAdminSettings(actor)).toBe(false);
    expect(canUseSettings(actor, "manage_developer")).toBe(false);
    expect(canAccessSettingsSection(actor, "manage_workspace")).toBe(false);
  });

  it("allows settings superadmin bridge when platformBypass is true", () => {
    const actor = {
      userId: "user-1",
      email: "workspace.moroz@gmail.com",
      role: "STAFF",
      platformBypass: true,
    };

    expect(canUseSettings(actor, "manage_developer")).toBe(true);
    expect(canAccessSettingsSection(actor, "manage_security")).toBe(true);
  });

  it("denies audit center access when bootstrap email lacks platformBypass", () => {
    expect(canViewAuditLogs("workspace.moroz@gmail.com", "STAFF", false)).toBe(false);
    expect(canExportAuditLogs("workspace.moroz@gmail.com", "STAFF", false)).toBe(false);
    expect(canManageRetentionPolicy("workspace.moroz@gmail.com", "STAFF", false)).toBe(false);
    expect(canViewSensitiveAuditDetail("workspace.moroz@gmail.com", "STAFF", false)).toBe(false);
  });

  it("allows audit center access when platformBypass is true", () => {
    expect(canViewAuditLogs("workspace.moroz@gmail.com", "STAFF", true)).toBe(true);
    expect(canExportAuditLogs("workspace.moroz@gmail.com", "STAFF", true)).toBe(true);
    expect(canManageRetentionPolicy("workspace.moroz@gmail.com", "STAFF", true)).toBe(true);
    expect(canViewSensitiveAuditDetail("workspace.moroz@gmail.com", "STAFF", true)).toBe(true);
  });

  it("preserves owner audit access without platformBypass", () => {
    expect(canViewAuditLogs("owner@example.com", "OWNER", false)).toBe(true);
    expect(canExportAuditLogs("owner@example.com", "OWNER", false)).toBe(true);
  });
});
