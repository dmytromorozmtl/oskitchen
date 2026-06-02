import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const STRATEGY_PATH = join(process.cwd(), "docs/webinar-strategy.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("webinar strategy doc", () => {
  it("exists with webinar types, run-of-show, and promotion", () => {
    const doc = readFileSync(STRATEGY_PATH, "utf8");
    expect(doc).toContain("# Webinar strategy — OS Kitchen");
    expect(doc).toContain("webinar-strategy-v1");
    expect(doc).toContain("## Webinar types");
    expect(doc).toContain("Today Command Center");
    expect(doc).toContain("## Promotion playbook");
    expect(doc).toContain("utm_source=webinar");
    expect(doc).toContain("demo-video-script-today.md");
    expect(doc).toContain("restaurant-partnerships-strategy.md");
  });

  it("reflects NO-GO baseline and forbidden webinar claims", () => {
    const doc = readFileSync(STRATEGY_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("NO-GO");
    expect(doc).toContain("0 webinars delivered");
    expect(doc).toContain("design partner");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(doc).toContain("SOC 2 certified");
    expect(doc).toContain("BETA");
  });
});
