import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  getFloorPlanPollIntervalMs,
  getFloorPlanRealtimeChannelName,
  getFloorPlanRealtimeFilter,
  FLOOR_PLAN_POLL_FALLBACK_MS,
  FLOOR_PLAN_POLL_WHEN_REALTIME_LIVE_MS,
} from "@/lib/restaurant/floor-plan-realtime-policy";
import {
  isFloorPlanRealtimeEnabled,
  nextFloorPlanReconnectDelayMs,
  resolveFloorPlanTransport,
} from "@/services/floor-plan-realtime";

const ROOT = process.cwd();

describe("floor plan realtime transport", () => {
  it("defaults to supabase when Supabase env is configured", () => {
    expect(
      isFloorPlanRealtimeEnabled({
        NEXT_PUBLIC_FLOOR_PLAN_REALTIME_ENABLED: undefined,
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe(true);
    expect(
      resolveFloorPlanTransport({
        NEXT_PUBLIC_FLOOR_PLAN_REALTIME_ENABLED: undefined,
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe("supabase");
  });

  it("forces polling when NEXT_PUBLIC_FLOOR_PLAN_REALTIME_ENABLED=false", () => {
    expect(
      isFloorPlanRealtimeEnabled({
        NEXT_PUBLIC_FLOOR_PLAN_REALTIME_ENABLED: "false",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe(false);
    expect(
      resolveFloorPlanTransport({
        NEXT_PUBLIC_FLOOR_PLAN_REALTIME_ENABLED: "false",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe("polling");
  });

  it("falls back to polling without Supabase configuration", () => {
    expect(
      resolveFloorPlanTransport({
        NEXT_PUBLIC_FLOOR_PLAN_REALTIME_ENABLED: undefined,
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      }),
    ).toBe("polling");
  });

  it("computes exponential reconnect backoff capped at 30s", () => {
    expect(nextFloorPlanReconnectDelayMs(0)).toBe(1_000);
    expect(nextFloorPlanReconnectDelayMs(1)).toBe(2_000);
    expect(nextFloorPlanReconnectDelayMs(4)).toBe(16_000);
    expect(nextFloorPlanReconnectDelayMs(10)).toBe(30_000);
  });

  it("uses workspace-scoped channel and filter when workspaceId is set", () => {
    expect(getFloorPlanRealtimeChannelName("ws-1", "user-1")).toBe("floor-plan-ws-1");
    expect(getFloorPlanRealtimeFilter("ws-1", "user-1")).toBe("workspace_id=eq.ws-1");
  });

  it("falls back to user_id filter when workspaceId is null", () => {
    expect(getFloorPlanRealtimeChannelName(null, "user-1")).toBe("floor-plan-user-1");
    expect(getFloorPlanRealtimeFilter(null, "user-1")).toBe("user_id=eq.user-1");
  });

  it("uses 15s poll when disconnected and 60s when live", () => {
    expect(getFloorPlanPollIntervalMs(false)).toBe(FLOOR_PLAN_POLL_FALLBACK_MS);
    expect(getFloorPlanPollIntervalMs(true)).toBe(FLOOR_PLAN_POLL_WHEN_REALTIME_LIVE_MS);
  });

  it("wires Supabase channel helpers in the realtime service", () => {
    const source = readFileSync(join(ROOT, "services/floor-plan-realtime.ts"), "utf8");
    expect(source).toContain("floor-plan-realtime-policy");
    expect(source).toContain("getFloorPlanRealtimeChannelName");
    expect(source).toContain("nextFloorPlanReconnectDelayMs");
    expect(source).toContain("FLOOR_PLAN_REALTIME_TABLE");
    expect(source).toContain("NEXT_PUBLIC_FLOOR_PLAN_REALTIME_ENABLED");
  });
});
