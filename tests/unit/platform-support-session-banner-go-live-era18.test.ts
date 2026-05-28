import { describe, expect, it } from "vitest";

import type { PlatformGoLiveProjectRow } from "@/lib/go-live/platform-go-live-focus-era18";
import {
  buildPlatformSupportSessionBannerGoLiveModel,
  pickPlatformWorkspaceGoLiveUrgentProject,
} from "@/lib/go-live/platform-support-session-banner-go-live-era18";
import {
  PLATFORM_SUPPORT_SESSION_BANNER_GO_LIVE_ERA18_BACKLOG_ID,
  PLATFORM_SUPPORT_SESSION_BANNER_GO_LIVE_ERA18_POLICY_ID,
  PLATFORM_SUPPORT_SESSION_BANNER_GO_LIVE_ERA18_PROOF_STATUS,
  platformWorkspaceGoLiveProjectHref,
  platformWorkspaceGoLiveSectionHref,
} from "@/lib/go-live/platform-support-session-banner-go-live-era18-policy";

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

describe("platform-support-session-banner-go-live-era18 policy", () => {
  it("registers era18 support session banner go-live proof", () => {
    expect(PLATFORM_SUPPORT_SESSION_BANNER_GO_LIVE_ERA18_POLICY_ID).toBe(
      "era18-platform-support-session-banner-go-live-v1",
    );
    expect(PLATFORM_SUPPORT_SESSION_BANNER_GO_LIVE_ERA18_PROOF_STATUS).toBe(
      "platform_support_session_banner_go_live_wired",
    );
    expect(PLATFORM_SUPPORT_SESSION_BANNER_GO_LIVE_ERA18_BACKLOG_ID).toBe("KOS-E18-056");
  });

  it("builds workspace go-live section and project hrefs", () => {
    expect(platformWorkspaceGoLiveSectionHref("ws-1")).toBe(
      "/platform/workspaces/ws-1#platform-workspace-go-live",
    );
    expect(platformWorkspaceGoLiveProjectHref("ws-1", "proj-1")).toBe(
      "/platform/workspaces/ws-1#go-live-project-proj-1",
    );
  });
});

describe("pickPlatformWorkspaceGoLiveUrgentProject", () => {
  it("prefers blocked projects over low-readiness launches", () => {
    const urgent = pickPlatformWorkspaceGoLiveUrgentProject([
      row({ id: "proj-a", readinessScore: 40, launchDate: new Date("2026-05-30T12:00:00Z") }),
      row({ id: "proj-b", status: "BLOCKED", readinessScore: 10 }),
    ], Date.parse("2026-05-28T12:00:00Z"));

    expect(urgent?.id).toBe("proj-b");
  });

  it("returns null when no active urgent projects exist", () => {
    expect(pickPlatformWorkspaceGoLiveUrgentProject([row({ status: "LIVE" })])).toBeNull();
  });
});

describe("buildPlatformSupportSessionBannerGoLiveModel", () => {
  it("links to workspace go-live section with active count", () => {
    const model = buildPlatformSupportSessionBannerGoLiveModel({
      workspaceId: "ws-1",
      projects: [row(), row({ id: "proj-2", status: "LIVE" })],
    });

    expect(model.activeProjectCount).toBe(1);
    expect(model.sectionLink.href).toBe("/platform/workspaces/ws-1#platform-workspace-go-live");
    expect(model.sectionLink.label).toBe("Go-live (1 active)");
  });

  it("surfaces urgent project review link when launch is at risk", () => {
    const model = buildPlatformSupportSessionBannerGoLiveModel({
      workspaceId: "ws-1",
      projects: [row({ status: "BLOCKED", readinessScore: 25 })],
      now: Date.parse("2026-05-28T12:00:00Z"),
    });

    expect(model.sectionLink.tone).toBe("urgent");
    expect(model.urgentProjectLink?.href).toBe("/platform/workspaces/ws-1#go-live-project-proj-1");
    expect(model.urgentProjectLink?.label).toContain("Main Brand");
  });
});
