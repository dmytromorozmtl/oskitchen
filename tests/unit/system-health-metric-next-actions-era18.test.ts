import { describe, expect, it } from "vitest";

import {
  PLATFORM_SYSTEM_HEALTH_TILE_NEXT_ACTIONS_ERA18_POLICY_ID,
  PLATFORM_SYSTEM_HEALTH_TILE_NEXT_ACTIONS_ERA18_PROOF_STATUS,
  SYSTEM_HEALTH_METRIC_NEXT_ACTIONS_ERA18_BACKLOG_ID,
  SYSTEM_HEALTH_METRIC_NEXT_ACTIONS_ERA18_POLICY_ID,
  SYSTEM_HEALTH_METRIC_NEXT_ACTIONS_ERA18_PROOF_STATUS,
} from "@/lib/system-health/system-health-metric-next-actions-era18-policy";
import {
  resolvePlatformSystemHealthTileRowNextAction,
  resolveSystemHealthMetricRowNextAction,
} from "@/lib/system-health/system-health-focus-era18";

describe("system-health-metric-next-actions-era18 policy", () => {
  it("registers era18 system health metric next action proof", () => {
    expect(SYSTEM_HEALTH_METRIC_NEXT_ACTIONS_ERA18_POLICY_ID).toBe(
      "era18-system-health-metric-next-actions-v1",
    );
    expect(SYSTEM_HEALTH_METRIC_NEXT_ACTIONS_ERA18_PROOF_STATUS).toBe(
      "system_health_metric_next_actions_wired",
    );
    expect(SYSTEM_HEALTH_METRIC_NEXT_ACTIONS_ERA18_BACKLOG_ID).toBe("KOS-E18-036");
  });

  it("registers era18 platform system health tile next action proof", () => {
    expect(PLATFORM_SYSTEM_HEALTH_TILE_NEXT_ACTIONS_ERA18_POLICY_ID).toBe(
      "era18-platform-system-health-tile-next-actions-v1",
    );
    expect(PLATFORM_SYSTEM_HEALTH_TILE_NEXT_ACTIONS_ERA18_PROOF_STATUS).toBe(
      "platform_system_health_tile_next_actions_wired",
    );
  });
});

describe("resolveSystemHealthMetricRowNextAction", () => {
  it("returns urgent fix for integration errors", () => {
    expect(resolveSystemHealthMetricRowNextAction("integration-errors", 1)).toEqual({
      label: "Fix channel connections",
      href: "/dashboard/sales-channels/health",
      tone: "urgent",
    });
  });

  it("returns null when integrity flags are clear", () => {
    expect(resolveSystemHealthMetricRowNextAction("integrity-flags", 0)).toBeNull();
  });

  it("always offers order hub navigation for active orders", () => {
    expect(resolveSystemHealthMetricRowNextAction("active-orders", 12)).toEqual({
      label: "Open order hub",
      href: "/dashboard/orders",
      tone: "normal",
    });
  });
});

describe("resolvePlatformSystemHealthTileRowNextAction", () => {
  it("returns workspace review for platform workspaces tile", () => {
    expect(resolvePlatformSystemHealthTileRowNextAction("workspaces", 42)).toEqual({
      label: "Review workspaces",
      href: "/platform/workspaces",
      tone: "normal",
    });
  });

  it("returns null when webhook backlog is clear", () => {
    expect(resolvePlatformSystemHealthTileRowNextAction("webhook-backlog", 0)).toBeNull();
  });
});
