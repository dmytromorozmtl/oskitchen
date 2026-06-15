import { describe, expect, it } from "vitest";

import {
  buildEnterpriseMultiLocationDashboardV2,
  buildLocationComparisonPair,
  filterEnterpriseLocationRanks,
  paginateItems,
  resolveMultiLocationScaleTier,
} from "@/lib/enterprise/multi-location-dashboard-2-builders";
import {
  MULTI_LOCATION_DASHBOARD_2_POLICY_ID,
  MULTI_LOCATION_ENTERPRISE_SCALE_THRESHOLD,
  MULTI_LOCATION_RANK_PAGE_SIZE,
} from "@/lib/enterprise/multi-location-dashboard-2-policy";
import type { EnterpriseLocationRank } from "@/lib/enterprise/multi-location-types";
import { parseMultiLocationDashboard2ViewState } from "@/services/enterprise/multi-location-service";

function rank(partial: Partial<EnterpriseLocationRank> & Pick<EnterpriseLocationRank, "locationId" | "locationName">): EnterpriseLocationRank {
  return {
    rank: 1,
    revenue: 1000,
    orders: 10,
    laborPct: 25,
    foodCostPct: 30,
    revenueShare: 10,
    vsAvgRevenue: null,
    vsAvgLaborPct: null,
    vsAvgFoodCostPct: null,
    ...partial,
  };
}

describe("multi-location dashboard 2.0 (ENT-63)", () => {
  it("locks ENT-63 policy and enterprise scale threshold", () => {
    expect(MULTI_LOCATION_DASHBOARD_2_POLICY_ID).toBe("multi-location-dashboard-2-ent63-v1");
    expect(MULTI_LOCATION_ENTERPRISE_SCALE_THRESHOLD).toBe(100);
    expect(resolveMultiLocationScaleTier(99)).toBe("standard");
    expect(resolveMultiLocationScaleTier(120)).toBe("enterprise");
  });

  it("filters and paginates ranks for 100+ networks", () => {
    const ranks = Array.from({ length: 120 }, (_, index) =>
      rank({
        locationId: `loc-${index}`,
        locationName: index === 5 ? "Downtown Flagship" : `Site ${index}`,
        rank: index + 1,
        revenue: 1200 - index,
      }),
    );
    const filtered = filterEnterpriseLocationRanks(ranks, "flagship");
    expect(filtered).toHaveLength(1);
    const paged = paginateItems(ranks, 3, MULTI_LOCATION_RANK_PAGE_SIZE);
    expect(paged.page).toBe(3);
    expect(paged.pageCount).toBe(5);
    expect(paged.items).toHaveLength(MULTI_LOCATION_RANK_PAGE_SIZE);
  });

  it("builds side-by-side comparison pair with deltas", () => {
    const ranks = [
      rank({ locationId: "a", locationName: "A", revenue: 2000, orders: 20, laborPct: 22 }),
      rank({ locationId: "b", locationName: "B", revenue: 1000, orders: 10, laborPct: 28 }),
    ];
    const pair = buildLocationComparisonPair(ranks, "a", "b");
    expect(pair?.revenueDelta).toBe(1000);
    expect(pair?.ordersDelta).toBe(10);
    expect(pair?.laborPctDelta).toBe(-6);
  });

  it("parses dashboard view state from search params", () => {
    const view = parseMultiLocationDashboard2ViewState({
      page: "2",
      tablePage: "3",
      q: "north",
      compareA: "loc-a",
      compareB: "loc-b",
    });
    expect(view.page).toBe(2);
    expect(view.tablePage).toBe(3);
    expect(view.searchQuery).toBe("north");
    expect(view.compareA).toBe("loc-a");
    expect(view.compareB).toBe("loc-b");
  });

  it("builds v2 dashboard slice with enterprise scale metadata", () => {
    const ranks = Array.from({ length: 110 }, (_, index) =>
      rank({ locationId: `loc-${index}`, locationName: `Site ${index}`, rank: index + 1 }),
    );
    const v2 = buildEnterpriseMultiLocationDashboardV2({
      ranks,
      totalLocations: 110,
      viewState: { page: 1, compareA: "loc-0", compareB: "loc-1" },
    });
    expect(v2.scaleTier).toBe("enterprise");
    expect(v2.supportsHundredPlus).toBe(true);
    expect(v2.paginatedRanks).toHaveLength(MULTI_LOCATION_RANK_PAGE_SIZE);
    expect(v2.comparisonPair?.locationA.locationId).toBe("loc-0");
  });
});
