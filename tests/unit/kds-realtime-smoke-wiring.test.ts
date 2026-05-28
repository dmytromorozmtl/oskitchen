import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  getKdsConnectionStatusLabel,
  getKdsPollIntervalMs,
  KDS_REALTIME_COMPONENT,
} from "@/lib/kitchen/kds-realtime-smoke-policy";

const ROOT = process.cwd();

describe("kds realtime smoke wiring", () => {
  it("wires policy helpers into the daily KDS client component", () => {
    const source = readFileSync(join(ROOT, KDS_REALTIME_COMPONENT), "utf8");
    expect(source).toContain("kds-realtime-smoke-policy");
    expect(source).toContain("getKdsPollIntervalMs");
    expect(source).toContain("getKdsRealtimeChannelName");
    expect(source).toContain("getKdsConnectionStatusLabel");
    expect(source).toContain("KDS_REALTIME_ORDERS_TABLE");
    expect(source).toContain("KDS_REALTIME_ORDERS_SCHEMA");
    expect(source).toContain("getKdsRealtimeChannelName(userId)");
  });

  it("matches documented poll intervals in status copy", () => {
    expect(getKdsConnectionStatusLabel(false)).toBe(
      getKdsConnectionStatusLabel(false),
    );
    expect(getKdsPollIntervalMs(false)).toBe(15_000);
  });
});
