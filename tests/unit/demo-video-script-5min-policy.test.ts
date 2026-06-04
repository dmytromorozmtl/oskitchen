import { describe, expect, it } from "vitest";

import {
  auditDemoVideo5MinDoc,
  DEMO_VIDEO_5MIN_POLICY_ID,
  DEMO_VIDEO_5MIN_SEGMENTS,
  DEMO_VIDEO_5MIN_TARGET_SECONDS,
  lintDemoVideoVoiceover,
  totalDemoVideo5MinDurationSec,
} from "@/lib/marketing/demo-video-script-5min-policy";

describe("demo video 5min script policy (MKT-12)", () => {
  it("locks MKT-12 policy id and 7-act timing ladder", () => {
    expect(DEMO_VIDEO_5MIN_POLICY_ID).toBe("demo-video-script-5min-mkt12-v1");
    expect(DEMO_VIDEO_5MIN_SEGMENTS).toHaveLength(7);
    expect(totalDemoVideo5MinDurationSec()).toBe(DEMO_VIDEO_5MIN_TARGET_SECONDS);
  });

  it("passes audit on canonical 5-min script doc", () => {
    const audit = auditDemoVideo5MinDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.segmentDurationTotalSec).toBe(300);
  });

  it("flags forbidden voiceover phrases", () => {
    const result = lintDemoVideoVoiceover(
      "We replace Toast overnight with live DoorDash sync and proven ROI.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest pilot voiceover", () => {
    const result = lintDemoVideoVoiceover(
      "Integrations are BETA until smoke-certified PASS. Founding design partners welcome.",
    );
    expect(result.passed).toBe(true);
  });
});
