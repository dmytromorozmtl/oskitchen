import { describe, expect, it } from "vitest";

import type { PlatformGoLiveProjectRow } from "@/lib/go-live/platform-go-live-focus-era18";
import {
  PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_BACKLOG_ID,
  PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_POLICY_ID,
  PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_PROOF_STATUS,
  PLATFORM_WORKSPACE_GO_LIVE_SECTION_ID,
} from "@/lib/go-live/platform-workspace-go-live-focus-era18-policy";
import {
  resolvePlatformWorkspaceGoLivePrimaryAction,
  summarizePlatformWorkspaceGoLiveProjects,
} from "@/lib/go-live/platform-workspace-go-live-focus-era18";

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

const baseContext = {
  workspaceId: "ws-1",
  activeSupportWorkspaceId: null as string | null,
  canImpersonate: false,
  canStartSupportSession: false,
};

describe("platform-workspace-go-live-focus-era18 policy", () => {
  it("registers era18 workspace go-live section proof", () => {
    expect(PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_POLICY_ID).toBe(
      "era18-platform-workspace-go-live-focus-v1",
    );
    expect(PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_PROOF_STATUS).toBe(
      "platform_workspace_go_live_section_wired",
    );
    expect(PLATFORM_WORKSPACE_GO_LIVE_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-055");
    expect(PLATFORM_WORKSPACE_GO_LIVE_SECTION_ID).toBe("platform-workspace-go-live");
  });
});

describe("resolvePlatformWorkspaceGoLivePrimaryAction", () => {
  it("offers impersonation when support session is active", () => {
    const action = resolvePlatformWorkspaceGoLivePrimaryAction(row(), {
      ...baseContext,
      activeSupportWorkspaceId: "ws-1",
      canImpersonate: true,
    });

    expect(action.kind).toBe("impersonate_tenant_go_live");
    if (action.kind === "impersonate_tenant_go_live") {
      expect(action.redirectTo).toBe("/dashboard/go-live/projects/proj-1");
      expect(action.targetUserId).toBe("user-1");
      expect(action.label).toBe("Review tenant go-live");
    }
  });

  it("prompts support session start before impersonation", () => {
    const action = resolvePlatformWorkspaceGoLivePrimaryAction(row(), {
      ...baseContext,
      canImpersonate: true,
      canStartSupportSession: true,
    });

    expect(action.kind).toBe("start_support_session");
  });

  it("requires support session when impersonation is allowed but session missing", () => {
    const action = resolvePlatformWorkspaceGoLivePrimaryAction(row(), {
      ...baseContext,
      canImpersonate: true,
      canStartSupportSession: false,
    });

    expect(action.kind).toBe("await_support_session");
  });

  it("falls back to read-only guidance without impersonation rights", () => {
    const action = resolvePlatformWorkspaceGoLivePrimaryAction(row(), baseContext);
    expect(action.kind).toBe("read_only");
  });

  it("marks blocked projects as urgent impersonation tone", () => {
    const action = resolvePlatformWorkspaceGoLivePrimaryAction(row({ status: "BLOCKED" }), {
      ...baseContext,
      activeSupportWorkspaceId: "ws-1",
      canImpersonate: true,
    });

    expect(action.kind).toBe("impersonate_tenant_go_live");
    if (action.kind === "impersonate_tenant_go_live") {
      expect(action.tone).toBe("urgent");
    }
  });
});

describe("summarizePlatformWorkspaceGoLiveProjects", () => {
  it("counts active and blocked projects", () => {
    const summary = summarizePlatformWorkspaceGoLiveProjects([
      row({ readinessScore: 40 }),
      row({ id: "proj-2", status: "BLOCKED", readinessScore: 20 }),
      row({ id: "proj-3", status: "LIVE", readinessScore: 100 }),
    ]);

    expect(summary.activeCount).toBe(2);
    expect(summary.blockedCount).toBe(1);
    expect(summary.lowestReadiness).toBe(20);
  });
});
