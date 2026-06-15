import { describe, expect, it } from "vitest";

import {
  auditQrOrderingPilotStoryDoc,
  lintQrOrderingPilotStoryCopy,
  QR_ORDERING_PILOT_ONE_LINE_PITCH,
  QR_ORDERING_PILOT_STORY_BEATS,
  QR_ORDERING_PILOT_STORY_POLICY_ID,
  totalQrPilotStoryDurationSec,
} from "@/lib/marketing/qr-ordering-pilot-story-policy";

describe("QR ordering pilot story policy (MKT-14)", () => {
  it("locks MKT-14 policy id and 2-minute story arc", () => {
    expect(QR_ORDERING_PILOT_STORY_POLICY_ID).toBe("qr-ordering-pilot-story-mkt14-v1");
    expect(QR_ORDERING_PILOT_STORY_BEATS).toHaveLength(5);
    expect(totalQrPilotStoryDurationSec()).toBe(120);
    expect(QR_ORDERING_PILOT_ONE_LINE_PITCH).toContain("BETA");
  });

  it("passes audit on canonical pilot story doc", () => {
    const audit = auditQrOrderingPilotStoryDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
  });

  it("flags forbidden QR pilot claims in copy", () => {
    const result = lintQrOrderingPilotStoryCopy(
      "Our full-service QR table service includes realtime floor plan and pay-at-table included.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest pilot copy", () => {
    const result = lintQrOrderingPilotStoryCopy(
      "First-party QR to daily menu — BETA until table metadata Phase 2 and staging E2E PASS.",
    );
    expect(result.passed).toBe(true);
  });
});
