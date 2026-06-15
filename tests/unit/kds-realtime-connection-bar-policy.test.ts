import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildKdsConnectionBarSnapshot,
  formatKdsRealtimeSloInline,
  formatKdsReconnectDetail,
  KDS_CONNECTION_BAR_TOUCH_CLASS,
  KDS_REALTIME_CONNECTION_BAR_MODULE,
  KDS_REALTIME_CONNECTION_BAR_POLICY_ID,
  KDS_REALTIME_CONNECTION_BAR_TEST_ID,
} from "@/lib/kitchen/kds-realtime-connection-bar-policy";
import { summarizeKdsRealtimeSloMetrics } from "@/lib/kitchen/kds-realtime-slo-metrics";
import { POS_WCAG_FLOOR_PX } from "@/lib/pos/touch-targets";

const ROOT = process.cwd();

describe("KDS realtime connection bar policy (DES-15)", () => {
  it("locks DES-15 policy id and test id", () => {
    expect(KDS_REALTIME_CONNECTION_BAR_POLICY_ID).toBe("kds-realtime-connection-bar-des15-v1");
    expect(KDS_REALTIME_CONNECTION_BAR_TEST_ID).toBe("kds-realtime-connection-bar");
  });

  it("formats reconnect detail when attempt > 0", () => {
    expect(formatKdsReconnectDetail(0)).toBeNull();
    expect(formatKdsReconnectDetail(2)).toBe("Reconnect 2/5");
  });

  it("formats SLO inline after minimum samples", () => {
    const slo = summarizeKdsRealtimeSloMetrics([120, 180, 240, 300, 400]);
    const line = formatKdsRealtimeSloInline(slo);
    expect(line).toMatch(/p50 \d+ms/);
    expect(line).toMatch(/p95 \d+ms/);
    expect(line).toMatch(/p99 \d+ms/);
  });

  it("builds connection bar snapshot with poll interval", () => {
    const snapshot = buildKdsConnectionBarSnapshot({
      isLive: false,
      transport: "polling",
      connectionLabel: "○ Polling fallback (15s)",
      reconnectAttempt: 0,
    });
    expect(snapshot.pollIntervalMs).toBe(15_000);
    expect(snapshot.isLive).toBe(false);
  });

  it("wires connection bar module with 44px touch and status badge", () => {
    const source = readFileSync(join(ROOT, KDS_REALTIME_CONNECTION_BAR_MODULE), "utf8");
    expect(source).toContain("KdsRealtimeStatusBadge");
    expect(source).toContain(KDS_REALTIME_CONNECTION_BAR_TEST_ID);
    expect(source).toContain("kds-connection-bar-slo");
    expect(KDS_CONNECTION_BAR_TOUCH_CLASS).toContain("min-h-11");
    expect(POS_WCAG_FLOOR_PX).toBe(44);
  });

  it("delegates kitchen realtime bar to connection bar component", () => {
    const wrapper = readFileSync(
      join(ROOT, "app/dashboard/kitchen/kds-kitchen-realtime-bar.tsx"),
      "utf8",
    );
    expect(wrapper).toContain("KdsRealtimeConnectionBar");
    expect(wrapper).toContain("kds-kitchen-realtime-bar");
  });
});
