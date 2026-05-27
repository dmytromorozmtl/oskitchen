import { describe, expect, it } from "vitest";

import {
  canUseNotifications,
  isSuperAdminNotifications,
  resolveNotificationActorScope,
} from "@/lib/notifications/notification-permissions";

describe("notifications platform bypass", () => {
  it("denies notifications superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = resolveNotificationActorScope({
      userId: "owner-1",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      platformBypass: false,
    });

    expect(isSuperAdminNotifications(scope)).toBe(false);
    expect(canUseNotifications(scope, "manage_rules")).toBe(false);
    expect(canUseNotifications(scope, "send_test_email")).toBe(false);
  });

  it("allows notifications superadmin bridge when platformBypass is true", () => {
    const scope = resolveNotificationActorScope({
      userId: "owner-1",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      platformBypass: true,
    });

    expect(isSuperAdminNotifications(scope)).toBe(true);
    expect(canUseNotifications(scope, "manage_rules")).toBe(true);
    expect(canUseNotifications(scope, "retry_failed")).toBe(true);
  });

  it("passes platformBypass from workspace actor into notification scope", () => {
    const scope = resolveNotificationActorScope({
      userId: "owner-1",
      email: "operator@example.com",
      profileRole: "staff",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canUseNotifications(scope, "manage_provider")).toBe(true);
  });

  it("preserves owner notification access without platformBypass", () => {
    const scope = resolveNotificationActorScope({
      userId: "owner-1",
      email: "owner@example.com",
      profileRole: "owner",
      platformBypass: false,
    });

    expect(canUseNotifications(scope, "manage_rules")).toBe(true);
    expect(canUseNotifications(scope, "send_test_email")).toBe(true);
  });

  it("preserves role-scoped notification access without platformBypass", () => {
    const scope = resolveNotificationActorScope({
      userId: "owner-1",
      email: "manager@example.com",
      profileRole: "manager",
      platformBypass: false,
    });

    expect(canUseNotifications(scope, "retry_failed")).toBe(true);
    expect(canUseNotifications(scope, "manage_provider")).toBe(false);
  });
});
