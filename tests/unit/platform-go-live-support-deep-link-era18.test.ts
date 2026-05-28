import { describe, expect, it } from "vitest";

import {
  PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_BACKLOG_ID,
  PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_POLICY_ID,
  PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_PROOF_STATUS,
  platformGoLiveTenantProjectHref,
} from "@/lib/go-live/platform-go-live-support-deep-link-era18-policy";
import {
  platformGoLiveWorkspaceProjectHref,
  resolvePlatformGoLiveRowActions,
  resolvePlatformGoLiveRowNextAction,
  type PlatformGoLiveProjectRow,
} from "@/lib/go-live/platform-go-live-focus-era18";
import {
  sanitizePlatformImpersonationRedirect,
  sanitizePlatformSupportSessionRedirect,
} from "@/lib/platform/platform-impersonation-redirect";

function row(over: Partial<PlatformGoLiveProjectRow> = {}): PlatformGoLiveProjectRow {
  return {
    id: "proj-1",
    userId: "user-1",
    workspaceId: "ws-1",
    workspaceName: "Pilot Kitchen",
    ownerEmail: "owner@example.com",
    brandName: "Main Brand",
    locationName: "Downtown",
    status: "IN_PROGRESS",
    riskLevel: "MEDIUM",
    readinessScore: 55,
    launchDate: new Date("2026-06-05T12:00:00Z"),
    openIncidentCount: 0,
    ...over,
  };
}

describe("platform-go-live-support-deep-link-era18 policy", () => {
  it("registers era18 tenant deep link proof", () => {
    expect(PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_POLICY_ID).toBe(
      "era18-platform-go-live-support-deep-link-v1",
    );
    expect(PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_PROOF_STATUS).toBe(
      "platform_go_live_tenant_deep_link_wired",
    );
    expect(PLATFORM_GO_LIVE_SUPPORT_DEEP_LINK_ERA18_BACKLOG_ID).toBe("KOS-E18-054");
  });

  it("builds tenant go-live project href", () => {
    expect(platformGoLiveTenantProjectHref("proj-abc")).toBe("/dashboard/go-live/projects/proj-abc");
  });
});

describe("sanitizePlatformImpersonationRedirect", () => {
  it("allows dashboard paths only", () => {
    expect(sanitizePlatformImpersonationRedirect("/dashboard/go-live/projects/x")).toBe(
      "/dashboard/go-live/projects/x",
    );
    expect(sanitizePlatformImpersonationRedirect("//evil.com")).toBe("/platform/dashboard");
    expect(sanitizePlatformImpersonationRedirect("/platform/workspaces/ws-1")).toBe("/platform/dashboard");
  });
});

describe("sanitizePlatformSupportSessionRedirect", () => {
  it("allows platform paths only", () => {
    const fallback = "/platform/workspaces/ws-1";
    expect(
      sanitizePlatformSupportSessionRedirect("/platform/workspaces/ws-1#go-live-project-p1", fallback),
    ).toBe("/platform/workspaces/ws-1#go-live-project-p1");
    expect(sanitizePlatformSupportSessionRedirect("/dashboard/today", fallback)).toBe(fallback);
  });
});

describe("resolvePlatformGoLiveRowActions", () => {
  it("includes workspace anchor and tenant impersonation when allowed", () => {
    const actions = resolvePlatformGoLiveRowActions(row(), {
      activeSupportWorkspaceId: null,
      canImpersonate: true,
    });

    expect(actions[0]?.kind).toBe("workspace");
    expect(actions[0]?.href).toBe("/platform/workspaces/ws-1#go-live-project-proj-1");
    expect(actions[1]?.kind).toBe("tenant_go_live");
    expect(actions[1]?.href).toBe("/dashboard/go-live/projects/proj-1");
    expect(actions[1]?.impersonationTargetUserId).toBe("user-1");
  });

  it("marks workspace action when support session is active", () => {
    const actions = resolvePlatformGoLiveRowActions(row(), {
      activeSupportWorkspaceId: "ws-1",
      canImpersonate: false,
    });

    expect(actions[0]?.label).toContain("session");
    expect(actions.some((action) => action.kind === "start_support_session")).toBe(false);
  });

  it("offers start support session when impersonation is unavailable", () => {
    const actions = resolvePlatformGoLiveRowActions(row(), {
      activeSupportWorkspaceId: null,
      canImpersonate: false,
    });

    expect(actions.some((action) => action.kind === "start_support_session")).toBe(true);
  });
});

describe("resolvePlatformGoLiveRowNextAction", () => {
  it("links to workspace anchor when workspaceId exists", () => {
    const action = resolvePlatformGoLiveRowNextAction(row());
    expect(action.href).toBe("/platform/workspaces/ws-1#go-live-project-proj-1");
  });
});

describe("platformGoLiveWorkspaceProjectHref", () => {
  it("falls back to preview when workspace is missing", () => {
    expect(platformGoLiveWorkspaceProjectHref(row({ workspaceId: null }))).toBe("/platform/preview/user-1");
  });
});
