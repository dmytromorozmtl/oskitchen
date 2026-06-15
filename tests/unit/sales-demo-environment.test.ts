import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { EXECUTIVE_DEMO_DISCLAIMER } from "@/lib/demo/executive-dashboard-demo-data";
import { GOLDEN_DEMO_SCENARIOS } from "@/lib/demo/golden-demo-scenarios";

const DOC_PATH = join(process.cwd(), "docs/sales-demo-environment.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("sales demo environment doc", () => {
  it("exists with env tiers and demo flow", () => {
    const doc = readFileSync(DOC_PATH, "utf8");
    expect(doc).toContain("# Sales demo environment setup — OS Kitchen");
    expect(doc).toContain("sales-demo-environment-v1");
    expect(doc).toContain("NEXT_PUBLIC_NAV_RELEASE_PROFILE");
    expect(doc).toContain("DEMO_MODE_ENABLED");
    expect(doc).toContain("KITCHEN_CAMERA_SYNTHETIC");
    expect(doc).toContain("## Golden demo scenarios");
    expect(doc).toContain("/dashboard/analytics/executive-demo");
    expect(doc).toContain("sales-limitation-sheet.md");
  });

  it("aligns with golden scenarios and pilot NO-GO gate", () => {
    const doc = readFileSync(DOC_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("NO-GO");
    expect(doc).toContain(EXECUTIVE_DEMO_DISCLAIMER.split(" — ")[0]!);
    for (const scenario of GOLDEN_DEMO_SCENARIOS.slice(0, 3)) {
      expect(doc).toContain(scenario.scenarioId);
    }
  });
});
