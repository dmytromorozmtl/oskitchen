import { describe, expect, it } from "vitest";

import {
  auditIntegrationHonestyScreenShareDoc,
  getIntegrationHonestyScreenShareSegmentById,
  INTEGRATION_HONESTY_LABELS,
  INTEGRATION_HONESTY_SCREEN_SHARE_POLICY_ID,
  INTEGRATION_HONESTY_SCREEN_SHARE_SEGMENTS,
  lintIntegrationHonestyScreenShareCopy,
  listIntegrationHonestyScreenShareSegmentIds,
  totalIntegrationHonestyScreenShareDurationSec,
} from "@/lib/marketing/integration-honesty-screen-share-policy";

describe("integration honesty screen-share policy (MKT-27)", () => {
  it("locks MKT-27 policy id and seven screen-share segments", () => {
    expect(INTEGRATION_HONESTY_SCREEN_SHARE_POLICY_ID).toBe(
      "integration-honesty-screen-share-mkt27-v1",
    );
    expect(INTEGRATION_HONESTY_SCREEN_SHARE_SEGMENTS).toHaveLength(7);
    expect(listIntegrationHonestyScreenShareSegmentIds()).toContain("S5");
    expect(INTEGRATION_HONESTY_LABELS).toHaveLength(5);
  });

  it("maps S5 skipped-row segment with recovery focus", () => {
    const s5 = getIntegrationHonestyScreenShareSegmentById("S5");
    expect(s5?.slug).toBe("skipped-row");
    expect(totalIntegrationHonestyScreenShareDurationSec()).toBe(390);
  });

  it("passes audit on canonical integration honesty screen-share doc", () => {
    const audit = auditIntegrationHonestyScreenShareDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.segmentCount).toBe(7);
    expect(audit.labelCount).toBe(INTEGRATION_HONESTY_LABELS.length);
  });

  it("flags forbidden hide-skipped screen-share claims", () => {
    const result = lintIntegrationHonestyScreenShareCopy(
      "Don't worry about the yellow rows — everything is live and all channels live with Uber Eats official partner.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest integration honesty talk track", () => {
    const result = lintIntegrationHonestyScreenShareCopy(
      "SKIPPED means staging smoke not run — we pause on BETA and PLACEHOLDER rows during screen-share.",
    );
    expect(result.passed).toBe(true);
  });
});
