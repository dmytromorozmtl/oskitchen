import { describe, expect, it } from "vitest";

import {
  getKdsRealtimeBadgeMode,
  getKdsRealtimeStatusMeta,
  KDS_KITCHEN_DASHBOARD_ROUTE,
} from "@/lib/kitchen/kds-realtime-ui";

describe("kds realtime ui", () => {
  it("maps live state to LIVE badge mode", () => {
    expect(getKdsRealtimeBadgeMode(true)).toBe("LIVE");
    expect(getKdsRealtimeBadgeMode(false)).toBe("POLLING");
  });

  it("returns LIVE meta when Realtime is subscribed", () => {
    const meta = getKdsRealtimeStatusMeta({ isLive: true, transport: "supabase" });
    expect(meta.mode).toBe("LIVE");
    expect(meta.label).toBe("LIVE");
    expect(meta.pulse).toBe(true);
  });

  it("returns POLLING meta with reconnect detail when retrying", () => {
    const meta = getKdsRealtimeStatusMeta({
      isLive: false,
      transport: "supabase",
      reconnectAttempt: 2,
    });
    expect(meta.mode).toBe("POLLING");
    expect(meta.label).toBe("POLLING");
    expect(meta.detail).toContain("Reconnecting");
  });

  it("returns POLLING meta when Realtime is disabled", () => {
    const meta = getKdsRealtimeStatusMeta({ isLive: false, transport: "polling" });
    expect(meta.mode).toBe("POLLING");
    expect(meta.detail).toContain("disabled");
  });

  it("locks kitchen dashboard route", () => {
    expect(KDS_KITCHEN_DASHBOARD_ROUTE).toBe("/dashboard/kitchen");
  });
});
