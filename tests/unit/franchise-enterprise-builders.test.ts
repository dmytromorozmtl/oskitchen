import { describe, expect, it } from "vitest";

import {
  buildFranchiseUnitRows,
  evaluateMenuCompliance,
  resolveBrandStatus,
} from "@/lib/enterprise/franchise-builders";
import { DEFAULT_FRANCHISE_SUITE_SETTINGS } from "@/lib/enterprise/franchise-types";

describe("franchise enterprise builders", () => {
  it("scores menu compliance from required items", () => {
    const result = evaluateMenuCompliance({
      requiredItems: ["Burger", "Fries", "Cola"],
      franchiseeProductNames: ["burger", "Salad"],
    });
    expect(result.percent).toBe(33);
    expect(result.missing).toContain("Fries");
  });

  it("marks strict enforcement as non-compliant below 95%", () => {
    expect(resolveBrandStatus(90, { mode: "strict", lockedMenuItems: [], requiredItemCount: 0 })).toBe(
      "review",
    );
    expect(resolveBrandStatus(70, { mode: "strict", lockedMenuItems: [], requiredItemCount: 0 })).toBe(
      "non_compliant",
    );
  });

  it("builds unit rows with royalty and compliance", () => {
    const units = buildFranchiseUnitRows({
      royalties: {
        period: "month",
        since: "2026-06-01",
        totalRoyalties: 500,
        franchises: [
          {
            franchiseId: "f1",
            franchiseName: "Downtown",
            franchiseeId: "u1",
            totalRevenue: 10000,
            royaltyRate: 5,
            royaltyAmount: 500,
          },
        ],
      },
      productNamesByFranchisee: new Map([["u1", ["Burger", "Fries"]]]),
      settings: {
        ...DEFAULT_FRANCHISE_SUITE_SETTINGS,
        menuEnforcement: {
          mode: "guided",
          lockedMenuItems: ["Burger", "Fries", "Cola"],
          requiredItemCount: 3,
        },
      },
      canonicalMenuItems: [],
    });
    expect(units).toHaveLength(1);
    expect(units[0]?.royaltyAmount).toBe(500);
    expect(units[0]?.menuCompliancePercent).toBe(67);
  });
});
