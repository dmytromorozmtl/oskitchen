import { describe, expect, it } from "vitest";

import {
  buildCommercialPilotOpsGoLiveBridgeRows,
  filterPlatformPilotLaunchBlockerProjects,
  isPlatformPilotLaunchBlocker,
  mergeCommercialPilotOpsAttentionItems,
  pickCommercialPilotOpsGoLiveBridgeAttentionItems,
  resolveCommercialPilotOpsGoNoGoLaunchNextAction,
  resolvePlatformPilotLaunchBlockerReason,
} from "@/lib/commercial/commercial-pilot-ops-go-live-bridge-era18";
import {
  COMMERCIAL_PILOT_OPS_GO_LIVE_BRIDGE_ERA18_BACKLOG_ID,
  COMMERCIAL_PILOT_OPS_GO_LIVE_BRIDGE_ERA18_POLICY_ID,
  COMMERCIAL_PILOT_OPS_GO_LIVE_BRIDGE_ERA18_PROOF_STATUS,
  commercialPilotBlockedLaunchesHref,
} from "@/lib/commercial/commercial-pilot-ops-go-live-bridge-era18-policy";
import { buildCommercialPilotOpsStatusModel, resolveCommercialPilotOpsDecision } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import type { PlatformGoLiveProjectRow } from "@/lib/go-live/platform-go-live-focus-era18";

function row(over: Partial<PlatformGoLiveProjectRow> = {}): PlatformGoLiveProjectRow {
  return {
    id: "proj-1",
    userId: "user-1",
    workspaceId: "ws-1",
    workspaceName: "Pilot Kitchen",
    ownerEmail: "owner@example.com",
    brandName: "Main Brand",
    locationName: "Downtown",
    status: "BLOCKED",
    riskLevel: "HIGH",
    readinessScore: 35,
    launchDate: new Date("2026-06-05T12:00:00Z"),
    openIncidentCount: 0,
    ...over,
  };
}

const noGoModel = buildCommercialPilotOpsStatusModel({
  goNoGo: {
    artifactPresent: true,
    summary: {
      version: "era17-pilot-gono-go-v1",
      runAt: "2026-05-28T16:01:05.375Z",
      decision: "NO-GO",
      blockers: ["P0 staging proof not passed"],
      warnings: [],
      customerExecutionStatus: "skipped_missing_customer",
      customerName: null,
      loiSignedDate: null,
      icpQualification: { qualified: false, disqualifiers: [], missingCriteria: [] },
      evidenceGates: [],
      evaluatorInput: {
        tier0Pass: false,
        tier1Pass: false,
        tier2Pass: false,
        roleChecklistsComplete: false,
        forbiddenClaimsInContract: false,
        icpQualified: false,
        stagingUrl: null,
        commitSha: null,
      },
    },
  },
  p0Staging: { artifactPresent: false, summary: null },
});

describe("commercial-pilot-ops-go-live-bridge-era18 policy", () => {
  it("registers era18 bridge proof", () => {
    expect(COMMERCIAL_PILOT_OPS_GO_LIVE_BRIDGE_ERA18_POLICY_ID).toBe(
      "era18-commercial-pilot-ops-go-live-bridge-v1",
    );
    expect(COMMERCIAL_PILOT_OPS_GO_LIVE_BRIDGE_ERA18_PROOF_STATUS).toBe(
      "commercial_pilot_ops_go_live_bridge_wired",
    );
    expect(COMMERCIAL_PILOT_OPS_GO_LIVE_BRIDGE_ERA18_BACKLOG_ID).toBe("KOS-E18-057");
    expect(commercialPilotBlockedLaunchesHref()).toBe("/platform/implementations#blocked-pilot-launches");
  });
});

describe("isPlatformPilotLaunchBlocker", () => {
  it("treats blocked workspace projects as launch blockers", () => {
    expect(isPlatformPilotLaunchBlocker(row())).toBe(true);
    expect(isPlatformPilotLaunchBlocker(row({ workspaceId: null }))).toBe(false);
  });

  it("treats open incidents as launch blockers", () => {
    expect(isPlatformPilotLaunchBlocker(row({ status: "IN_PROGRESS", openIncidentCount: 2 }))).toBe(true);
  });
});

describe("buildCommercialPilotOpsGoLiveBridgeRows", () => {
  it("builds workspace go-live hrefs for blocked projects", () => {
    const rows = buildCommercialPilotOpsGoLiveBridgeRows([row(), row({ id: "proj-2", status: "LIVE" })]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.workspaceProjectHref).toBe("/platform/workspaces/ws-1#go-live-project-proj-1");
    expect(rows[0]?.workspaceGoLiveHref).toBe("/platform/workspaces/ws-1#platform-workspace-go-live");
    expect(rows[0]?.blockerReason).toContain("blocked");
  });
});

describe("pickCommercialPilotOpsGoLiveBridgeAttentionItems", () => {
  it("surfaces blocked launches when GO/NO-GO is NO-GO", () => {
    const items = pickCommercialPilotOpsGoLiveBridgeAttentionItems({
      opsModel: noGoModel,
      blockerProjects: [row()],
    });

    expect(items[0]?.id).toBe("blocked-pilot-launches");
    expect(items[0]?.href).toBe("/platform/implementations#blocked-pilot-launches");
  });

  it("returns empty when GO decision even with blocked tenant projects", () => {
    const goModel = buildCommercialPilotOpsStatusModel({
      goNoGo: {
        artifactPresent: true,
        summary: {
          version: "era17-pilot-gono-go-v1",
          runAt: "2026-05-28T16:01:05.375Z",
          decision: "GO",
          blockers: [],
          warnings: [],
          customerExecutionStatus: "skipped_missing_customer",
          customerName: null,
          loiSignedDate: null,
          icpQualification: { qualified: true, disqualifiers: [], missingCriteria: [] },
          evidenceGates: [],
          evaluatorInput: {
            tier0Pass: true,
            tier1Pass: true,
            tier2Pass: true,
            roleChecklistsComplete: true,
            forbiddenClaimsInContract: false,
            icpQualified: true,
            stagingUrl: "https://staging.example.com",
            commitSha: "abc123",
          },
        },
      },
      p0Staging: { artifactPresent: true, summary: null },
    });

    expect(resolveCommercialPilotOpsDecision(goModel.goNoGo)).toBe("GO");
    expect(
      pickCommercialPilotOpsGoLiveBridgeAttentionItems({
        opsModel: goModel,
        blockerProjects: [row()],
      }),
    ).toEqual([]);
  });
});

describe("mergeCommercialPilotOpsAttentionItems", () => {
  it("merges bridge items without duplicate ids", () => {
    const merged = mergeCommercialPilotOpsAttentionItems(
      [{ id: "a", title: "A", detail: "", href: "/a", priority: 1, tone: "urgent" }],
      [{ id: "blocked-pilot-launches", title: "B", detail: "", href: "/b", priority: 2, tone: "urgent" }],
    );

    expect(merged).toHaveLength(2);
  });
});

describe("resolveCommercialPilotOpsGoNoGoLaunchNextAction", () => {
  it("links GO/NO-GO panel to blocked launches section", () => {
    const action = resolveCommercialPilotOpsGoNoGoLaunchNextAction({
      decision: "NO-GO",
      blockerCount: 2,
    });

    expect(action?.href).toBe("/platform/implementations#blocked-pilot-launches");
    expect(action?.label).toContain("2");
  });
});

describe("resolvePlatformPilotLaunchBlockerReason", () => {
  it("describes rollback mode blockers", () => {
    expect(resolvePlatformPilotLaunchBlockerReason(row({ status: "ROLLBACK_MODE" })).reason).toContain(
      "Rollback",
    );
  });
});

describe("filterPlatformPilotLaunchBlockerProjects", () => {
  it("sorts blocked projects before incident-only projects", () => {
    const filtered = filterPlatformPilotLaunchBlockerProjects([
      row({ id: "proj-a", status: "IN_PROGRESS", openIncidentCount: 1, readinessScore: 80 }),
      row({ id: "proj-b", status: "BLOCKED", readinessScore: 20 }),
    ]);

    expect(filtered[0]?.id).toBe("proj-b");
  });
});
