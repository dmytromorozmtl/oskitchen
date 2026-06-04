import { describe, expect, it } from "vitest";

import {
  auditToastGapPublicSummaryDoc,
  getToastGapPublicSummaryBulletIds,
  lintToastGapPublicSummaryCopy,
  TOAST_GAP_BATTLE_CARD_ID,
  TOAST_GAP_PUBLIC_SUMMARY_POLICY_ID,
  TOAST_GAP_PUBLIC_SUMMARY_CTA,
  TOAST_OK_WEDGES_PUBLIC_BULLETS,
  TOAST_WINS_PUBLIC_BULLETS,
} from "@/lib/marketing/toast-gap-analysis-public-summary-policy";

describe("Toast gap analysis public summary policy (MKT-34)", () => {
  it("locks MKT-34 policy id, BC1, and six public bullets", () => {
    expect(TOAST_GAP_PUBLIC_SUMMARY_POLICY_ID).toBe(
      "toast-gap-analysis-public-summary-mkt34-v1",
    );
    expect(TOAST_GAP_BATTLE_CARD_ID).toBe("BC1");
    expect(TOAST_WINS_PUBLIC_BULLETS).toHaveLength(3);
    expect(TOAST_OK_WEDGES_PUBLIC_BULLETS).toHaveLength(3);
    expect(TOAST_GAP_PUBLIC_SUMMARY_CTA.href).toContain("toast-gap-mkt34");
  });

  it("exports toast win and wedge bullet ids", () => {
    const bullets = getToastGapPublicSummaryBulletIds();
    expect(bullets.toastWins).toEqual(["TW1", "TW2", "TW3"]);
    expect(bullets.osKitchenWedges).toEqual(["OK1", "OK2", "OK3"]);
  });

  it("passes audit on toast gap doc public summary section", () => {
    const audit = auditToastGapPublicSummaryDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.toastWinBulletCount).toBe(3);
    expect(audit.wedgeBulletCount).toBe(3);
  });

  it("flags forbidden Toast public summary claims", () => {
    const result = lintToastGapPublicSummaryCopy(
      "We beat Toast on everything — Toast killer with Toast-class rush hour and production-certified DoorDash.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest Toast gap public summary copy", () => {
    const result = lintToastGapPublicSummaryCopy(
      "Toast wins hardware and reference scale; OS Kitchen wedges production depth with Integration Health on /trust.",
    );
    expect(result.passed).toBe(true);
  });
});
