import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/native-mobile-app-plan.md");
const DEFER_PATH = join(process.cwd(), "docs/native-mobile-defer-rfc.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("native mobile app plan doc", () => {
  it("exists with React Native, white-label, and push notifications", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# Native mobile app plan — OS Kitchen");
    expect(doc).toContain("native-mobile-app-plan-v1");
    expect(doc).toContain("React Native");
    expect(doc).toContain("Expo");
    expect(doc).toContain("## White-label mobile");
    expect(doc).toContain("## Push notifications");
    expect(doc).toContain("APNs");
    expect(doc).toContain("FCM");
  });

  it("links defer RFC and reflects honest baseline", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const defer = readFileSync(DEFER_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("native-mobile-defer-rfc.md");
    expect(doc).toContain("Forbidden");
    expect(defer).toContain("DEFERRED");
  });
});
