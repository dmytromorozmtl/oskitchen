import { describe, expect, it } from "vitest";

import {
  PLATFORM_GO_LIVE_FOCUS_ERA18_BACKLOG_ID,
  PLATFORM_GO_LIVE_FOCUS_ERA18_POLICY_ID,
  PLATFORM_GO_LIVE_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/go-live/platform-go-live-focus-era18-policy";
import {
  buildPlatformGoLiveCommandCenterModel,
  buildPlatformGoLiveKpiSnapshot,
  isPlatformGoLiveProjectActive,
  pickPlatformGoLiveAttentionItems,
  platformGoLiveProjectLabel,
  resolvePlatformGoLiveRowNextAction,
  type PlatformGoLiveProjectRow,
} from "@/lib/go-live/platform-go-live-focus-era18";

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

describe("platform-go-live-focus-era18 policy", () => {
  it("registers era18 platform go-live command center proof", () => {
    expect(PLATFORM_GO_LIVE_FOCUS_ERA18_POLICY_ID).toBe("era18-platform-go-live-focus-v1");
    expect(PLATFORM_GO_LIVE_FOCUS_ERA18_PROOF_STATUS).toBe("platform_go_live_command_center_wired");
    expect(PLATFORM_GO_LIVE_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-053");
  });
});

describe("pickPlatformGoLiveAttentionItems", () => {
  it("surfaces overdue launch dates as urgent", () => {
    const items = pickPlatformGoLiveAttentionItems(
      [
        row({
          launchDate: new Date("2026-05-01T12:00:00Z"),
          status: "IN_PROGRESS",
        }),
      ],
      Date.parse("2026-05-28T12:00:00Z"),
    );

    expect(items[0]?.id).toBe("overdue-proj-1");
    expect(items[0]?.tone).toBe("urgent");
  });

  it("surfaces blocked projects before normal queue review", () => {
    const items = pickPlatformGoLiveAttentionItems([row({ status: "BLOCKED", readinessScore: 40 })]);

    expect(items.some((item) => item.id === "blocked-proj-1")).toBe(true);
  });

  it("surfaces low readiness within 7 days of launch", () => {
    const items = pickPlatformGoLiveAttentionItems(
      [row({ readinessScore: 45, launchDate: new Date("2026-05-30T12:00:00Z") })],
      Date.parse("2026-05-28T12:00:00Z"),
    );

    expect(items.some((item) => item.id === "readiness-proj-1")).toBe(true);
  });
});

describe("buildPlatformGoLiveKpiSnapshot", () => {
  it("counts active launches and open incidents", () => {
    const kpis = buildPlatformGoLiveKpiSnapshot([
      row({ openIncidentCount: 2 }),
      row({ id: "proj-2", status: "LIVE", openIncidentCount: 0 }),
    ]);

    expect(kpis.activeLaunchProjects).toBe(1);
    expect(kpis.openIncidents).toBe(2);
  });
});

describe("resolvePlatformGoLiveRowNextAction", () => {
  it("links to workspace when workspaceId exists", () => {
    const action = resolvePlatformGoLiveRowNextAction(row());
    expect(action.href).toBe("/platform/workspaces/ws-1");
  });

  it("links to tenant preview when workspace is missing", () => {
    const action = resolvePlatformGoLiveRowNextAction(row({ workspaceId: null }));
    expect(action.href).toBe("/platform/preview/user-1");
  });
});

describe("platformGoLiveProjectLabel", () => {
  it("prefers brand name over owner email", () => {
    expect(platformGoLiveProjectLabel(row())).toBe("Main Brand");
  });
});

describe("isPlatformGoLiveProjectActive", () => {
  it("treats LIVE as terminal", () => {
    expect(isPlatformGoLiveProjectActive("LIVE")).toBe(false);
    expect(isPlatformGoLiveProjectActive("IN_PROGRESS")).toBe(true);
  });
});

describe("buildPlatformGoLiveCommandCenterModel", () => {
  it("embeds kpi snapshot", () => {
    const model = buildPlatformGoLiveCommandCenterModel({ projects: [row()] });
    expect(model.kpis.activeLaunchProjects).toBe(1);
  });
});
