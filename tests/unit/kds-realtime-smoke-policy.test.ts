import { describe, expect, it } from "vitest";

import {
  getKdsConnectionStatusLabel,
  getKdsPollIntervalMs,
  getKdsRealtimeChannelName,
  KDS_POLL_FALLBACK_MS,
  KDS_POLL_WHEN_REALTIME_LIVE_MS,
  KDS_REALTIME_SMOKE_HONEST_SCOPE,
  KDS_REALTIME_SMOKE_POLICY_ID,
} from "@/lib/kitchen/kds-realtime-smoke-policy";

describe("kds realtime smoke policy", () => {
  it("locks era6 realtime smoke policy", () => {
    expect(KDS_REALTIME_SMOKE_POLICY_ID).toBe("era6-kds-realtime-smoke-v1");
    expect(KDS_REALTIME_SMOKE_HONEST_SCOPE.rushHourCertified).toBe(false);
    expect(KDS_REALTIME_SMOKE_HONEST_SCOPE.realtimePlaywrightCertified).toBe(false);
  });

  it("uses 15s poll fallback and 60s when realtime is live", () => {
    expect(KDS_POLL_FALLBACK_MS).toBe(15_000);
    expect(KDS_POLL_WHEN_REALTIME_LIVE_MS).toBe(60_000);
    expect(getKdsPollIntervalMs(false)).toBe(15_000);
    expect(getKdsPollIntervalMs(true)).toBe(60_000);
  });

  it("scopes realtime channel per tenant user", () => {
    expect(getKdsRealtimeChannelName("user-abc")).toBe("kds-orders-user-abc");
  });

  it("labels connection state honestly for operators", () => {
    expect(getKdsConnectionStatusLabel(false)).toContain("Polling fallback");
    expect(getKdsConnectionStatusLabel(true)).toContain("Supabase Realtime");
  });
});
