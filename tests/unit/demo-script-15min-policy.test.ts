import { describe, expect, it } from "vitest";

import {
  auditDemoScript15MinDoc,
  DEMO_SCRIPT_15MIN_DEMO_ROUTES,
  DEMO_SCRIPT_15MIN_POLICY_ID,
  DEMO_SCRIPT_15MIN_SEGMENTS,
  DEMO_SCRIPT_15MIN_TARGET_SECONDS,
  DEMO_SCRIPT_15MIN_UTM_CAMPAIGN,
  lintDemoScript15MinCopy,
  totalDemoScript15MinDurationSec,
} from "@/lib/marketing/demo-script-15min-policy";

describe("demo script 15min policy (MKT-22)", () => {
  it("locks MKT-22 policy id and 9-segment 15-minute ladder", () => {
    expect(DEMO_SCRIPT_15MIN_POLICY_ID).toBe("demo-script-15min-mkt22-v1");
    expect(DEMO_SCRIPT_15MIN_SEGMENTS).toHaveLength(9);
    expect(totalDemoScript15MinDurationSec()).toBe(DEMO_SCRIPT_15MIN_TARGET_SECONDS);
    expect(DEMO_SCRIPT_15MIN_TARGET_SECONDS).toBe(900);
  });

  it("maps six core demo routes including Integration Health", () => {
    expect(DEMO_SCRIPT_15MIN_DEMO_ROUTES).toContain("/dashboard/integration-health");
    expect(DEMO_SCRIPT_15MIN_DEMO_ROUTES).toHaveLength(6);
  });

  it("passes audit on canonical 15-min live demo script doc", () => {
    const audit = auditDemoScript15MinDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.segmentDurationTotalSec).toBe(900);
  });

  it("flags forbidden live demo phrases", () => {
    const result = lintDemoScript15MinCopy(
      "Replace Toast overnight with live Uber Eats and proven ROI — thousands of customers.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest staging demo copy", () => {
    const result = lintDemoScript15MinCopy(
      "Staging demo with BETA and SKIPPED Integration Health labels — design partner program.",
    );
    expect(result.passed).toBe(true);
    expect(DEMO_SCRIPT_15MIN_UTM_CAMPAIGN).toBe("demo-15min-mkt22");
  });
});
