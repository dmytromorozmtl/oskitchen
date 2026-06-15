import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  isKdsRealtimeEnabled,
  nextKdsReconnectDelayMs,
  resolveKdsTransport,
} from "@/services/kds-websocket";

const ROOT = process.cwd();

describe("kds websocket transport", () => {
  it("defaults to supabase when Supabase env is configured", () => {
    expect(
      isKdsRealtimeEnabled({
        NEXT_PUBLIC_KDS_REALTIME_ENABLED: undefined,
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe(true);
    expect(
      resolveKdsTransport({
        NEXT_PUBLIC_KDS_REALTIME_ENABLED: undefined,
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe("supabase");
  });

  it("forces polling when NEXT_PUBLIC_KDS_REALTIME_ENABLED=false", () => {
    expect(
      isKdsRealtimeEnabled({
        NEXT_PUBLIC_KDS_REALTIME_ENABLED: "false",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe(false);
    expect(
      resolveKdsTransport({
        NEXT_PUBLIC_KDS_REALTIME_ENABLED: "false",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe("polling");
  });

  it("falls back to polling without Supabase configuration", () => {
    expect(
      resolveKdsTransport({
        NEXT_PUBLIC_KDS_REALTIME_ENABLED: undefined,
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      }),
    ).toBe("polling");
  });

  it("computes exponential reconnect backoff capped at 30s", () => {
    expect(nextKdsReconnectDelayMs(0)).toBe(1_000);
    expect(nextKdsReconnectDelayMs(1)).toBe(2_000);
    expect(nextKdsReconnectDelayMs(4)).toBe(16_000);
    expect(nextKdsReconnectDelayMs(10)).toBe(30_000);
  });

  it("wires Supabase channel helpers in the websocket service", () => {
    const source = readFileSync(join(ROOT, "services/kds-websocket.ts"), "utf8");
    expect(source).toContain("kds-realtime-smoke-policy");
    expect(source).toContain("getKdsRealtimeChannelName");
    expect(source).toContain("nextKdsReconnectDelayMs");
    expect(source).toContain("KDS_REALTIME_ORDERS_TABLE");
    expect(source).toContain("NEXT_PUBLIC_KDS_REALTIME_ENABLED");
  });
});
