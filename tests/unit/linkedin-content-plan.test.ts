import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/linkedin-content-plan.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("linkedin content plan doc", () => {
  it("exists with pillars, cadence, and UTM discipline", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# LinkedIn content plan — OS Kitchen");
    expect(doc).toContain("linkedin-content-plan-v1");
    expect(doc).toContain("## Content pillars");
    expect(doc).toContain("## Posting cadence");
    expect(doc).toContain("utm_source=linkedin");
    expect(doc).toContain("7 proprietary AI modules");
    expect(doc).toContain("marketing-analytics-setup.md");
    expect(doc).toContain("sales-safe-claims-registry.md");
  });

  it("reflects NO-GO baseline and forbidden claims", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("NO-GO");
    expect(doc).toContain("0 signed customers");
    expect(doc).toContain("Never post");
    expect(doc).toContain("SOC 2 certified");
    expect(doc).toContain("ai-moats-honest-positioning.md");
  });
});
