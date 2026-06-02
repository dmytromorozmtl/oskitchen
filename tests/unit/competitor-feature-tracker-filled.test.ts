import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const TRACKER_PATH = join(process.cwd(), "artifacts/competitor-feature-tracker.json");

const SEVEN_COMPETITOR_IDS = [
  "toast",
  "square",
  "lightspeed",
  "clover",
  "touchbistro",
  "spoton",
  "oracle_simphony",
] as const;

describe("competitor feature tracker filled (task 101)", () => {
  it("has head-to-head profiles for all 7 competitors", () => {
    const tracker = JSON.parse(readFileSync(TRACKER_PATH, "utf8")) as {
      competitorComparison: {
        competitors: string[];
        headToHeadFilled: number;
        headToHead: Record<
          string,
          {
            competitorWins: string[];
            osKitchenWinsQualified: string[];
            safeTalkTrack: string;
          }
        >;
        competitorProfileIndex: Record<string, { tier: string; primaryBattlefield: string }>;
      };
      salesSafeFeatures: Record<string, { salesSafeVerdict: string }>;
    };

    expect(tracker.competitorComparison.headToHeadFilled).toBe(7);
    expect(tracker.competitorComparison.competitors).toEqual([...SEVEN_COMPETITOR_IDS]);

    for (const id of SEVEN_COMPETITOR_IDS) {
      const profile = tracker.competitorComparison.headToHead[id];
      expect(profile, `missing headToHead.${id}`).toBeDefined();
      expect(profile.competitorWins.length).toBeGreaterThanOrEqual(4);
      expect(profile.osKitchenWinsQualified.length).toBeGreaterThanOrEqual(4);
      expect(profile.safeTalkTrack.length).toBeGreaterThan(20);
      expect(tracker.competitorComparison.competitorProfileIndex[id]).toBeDefined();
    }
  });

  it("retains sales-safe feature ledger with honesty counts", () => {
    const tracker = JSON.parse(readFileSync(TRACKER_PATH, "utf8")) as {
      auditReconciliation: {
        salesSafeYes: number;
        salesSafePartial: number;
        salesSafePlaceholder: number;
      };
      salesSafeFeatures: Record<string, { salesSafeVerdict: string }>;
    };
    const verdicts = Object.values(tracker.salesSafeFeatures).map((f) => f.salesSafeVerdict);
    expect(verdicts.filter((v) => v === "yes").length).toBe(tracker.auditReconciliation.salesSafeYes);
    expect(verdicts.filter((v) => v === "partial").length).toBe(
      tracker.auditReconciliation.salesSafePartial,
    );
    expect(verdicts.filter((v) => v === "placeholder").length).toBe(
      tracker.auditReconciliation.salesSafePlaceholder,
    );
  });
});
