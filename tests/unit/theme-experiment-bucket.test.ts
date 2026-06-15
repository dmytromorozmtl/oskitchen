import { describe, expect, it } from "vitest";

import { armFromTrafficBucket, stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";
import { resolveThemeExperimentArm } from "@/lib/storefront/theme-experiment";

describe("theme experiment bucket", () => {
  it("stableBucketPercent is deterministic", () => {
    expect(stableBucketPercent("visitor-a")).toBe(stableBucketPercent("visitor-a"));
    expect(stableBucketPercent("visitor-a")).not.toBe(stableBucketPercent("visitor-b"));
  });

  it("armFromTrafficBucket respects traffic percent", () => {
    expect(armFromTrafficBucket(10, 50)).toBe("draft");
    expect(armFromTrafficBucket(60, 50)).toBe("published");
    expect(armFromTrafficBucket(0, 0)).toBe("published");
  });

  it("resolveThemeExperimentArm uses visitorId when no cookie", () => {
    const a = resolveThemeExperimentArm({
      config: { enabled: true, trafficPercent: 50 },
      cookieValue: null,
      visitorId: "sticky-visitor-1",
    });
    const b = resolveThemeExperimentArm({
      config: { enabled: true, trafficPercent: 50 },
      cookieValue: null,
      visitorId: "sticky-visitor-1",
    });
    expect(a.arm).toBe(b.arm);
    expect(a.setCookie).toBe(b.arm);
  });

  it("resolveThemeExperimentArm prefers requestArm over random", () => {
    const r = resolveThemeExperimentArm({
      config: { enabled: true, trafficPercent: 100 },
      cookieValue: null,
      requestArm: "published",
      visitorId: "v",
    });
    expect(r.arm).toBe("published");
    expect(r.setCookie).toBeUndefined();
  });
});
