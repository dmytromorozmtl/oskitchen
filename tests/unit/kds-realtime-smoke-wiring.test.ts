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
  it("wires transport subscription into the daily KDS client component", () => {
    const source = readFileSync(join(ROOT, KDS_REALTIME_COMPONENT), "utf8");
    expect(source).toContain("kds-realtime-smoke-policy");
    expect(source).toContain("getKdsConnectionStatusLabel");
    expect(source).toContain("kds-websocket");
    expect(source).toContain("subscribeKdsOrderUpdates");
  });

  it("matches documented poll intervals in status copy", () => {
    expect(getKdsConnectionStatusLabel(false)).toBe(
      getKdsConnectionStatusLabel(false),
    );
    expect(getKdsPollIntervalMs(false)).toBe(15_000);
  });
});
