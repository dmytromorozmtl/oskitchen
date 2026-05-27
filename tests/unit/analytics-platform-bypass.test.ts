import { describe, expect, it } from "vitest";

import {
  canDoAnalytics,
  isSuperAdminAnalytics,
} from "@/lib/analytics/analytics-permissions";
import { resolveAnalyticsActorScope } from "@/lib/analytics/resolve-analytics-actor-scope";

describe("analytics platform bypass", () => {
  it("denies analytics superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(isSuperAdminAnalytics(scope)).toBe(false);
    expect(canDoAnalytics(scope, "analytics.read.cost_margin")).toBe(false);
    expect(canDoAnalytics(scope, "analytics.export.csv")).toBe(false);
  });

  it("allows analytics superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(isSuperAdminAnalytics(scope)).toBe(true);
    expect(canDoAnalytics(scope, "analytics.read.customer_pii")).toBe(true);
    expect(canDoAnalytics(scope, "analytics.alert.manage")).toBe(true);
  });

  it("passes platformBypass from workspace actor into analytics scope", () => {
    const scope = resolveAnalyticsActorScope({
      workspaceRole: "STAFF",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      profileEmail: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canDoAnalytics(scope, "analytics.read.forecast")).toBe(true);
  });

  it("preserves owner analytics access without platformBypass", () => {
    const scope = resolveAnalyticsActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
      profileRole: "OWNER",
      profileEmail: "owner@example.com",
    });

    expect(canDoAnalytics(scope, "analytics.export.csv")).toBe(true);
    expect(canDoAnalytics(scope, "analytics.read.cost_margin")).toBe(true);
  });

  it("preserves role-scoped analytics access without platformBypass", () => {
    const scope = resolveAnalyticsActorScope({
      workspaceRole: "STAFF",
      email: "accountant@example.com",
      profileRole: "accountant",
      profileEmail: "accountant@example.com",
    });

    expect(canDoAnalytics(scope, "analytics.read.cost_margin")).toBe(true);
    expect(canDoAnalytics(scope, "analytics.read.customer_pii")).toBe(false);
  });
});
