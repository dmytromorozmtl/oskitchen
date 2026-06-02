import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const DASHBOARD_PATH = join(process.cwd(), "docs/mvp-marketing-dashboard.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("mvp marketing dashboard doc", () => {
  it("exists with weekly scorecard sections and review cadence", () => {
    const doc = readFileSync(DASHBOARD_PATH, "utf8");
    expect(doc).toContain("# MVP marketing dashboard — OS Kitchen");
    expect(doc).toContain("mvp-marketing-dashboard-v1");
    expect(doc).toContain("## Weekly scorecard");
    expect(doc).toContain("Section A — Traffic");
    expect(doc).toContain("Section B — Product funnel");
    expect(doc).toContain("Section C — Social");
    expect(doc).toContain("sign_up");
    expect(doc).toContain("marketing-analytics-setup.md");
    expect(doc).toContain("q3-2026-okrs.md");
  });

  it("reflects NO-GO baseline and excludes vanity revenue claims", () => {
    const doc = readFileSync(DASHBOARD_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("NO-GO");
    expect(doc).toContain("0 customers");
    expect(doc).toContain("What not to put on the dashboard");
    expect(doc).toContain("MRR / ARR");
    expect(doc).toContain("LOIs signed: 0");
  });
});
